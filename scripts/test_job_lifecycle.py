"""No network: incomplete runs must never become absence evidence."""
import importlib.util
import json
import tempfile
import unittest
import types
import sys
from unittest.mock import patch
from datetime import datetime, timezone
from pathlib import Path

spec = importlib.util.spec_from_file_location("publisher", Path(__file__).with_name("publish-jobs.py"))
publisher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(publisher)


class LifecycleTests(unittest.TestCase):
    def test_scraper_exception_cannot_be_reported_as_an_empty_success(self):
        sys.modules.setdefault("jobspy", types.SimpleNamespace(scrape_jobs=None))
        spec = importlib.util.spec_from_file_location("scraper_lifecycle", Path(__file__).with_name("scrape-jobs.py"))
        scraper = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(scraper)
        with patch.object(scraper, "scrape_jobs", side_effect=TimeoutError()):
            with self.assertRaisesRegex(RuntimeError, "Scrape incomplete"):
                scraper.scrape_swiss_jobs("Elektriker", "Zürich")

    def artifact(self, **changes):
        value = {"scrapedAt": datetime.now(timezone.utc).isoformat(), "complete": True,
                 "trade": "elektro", "fullSearch": True, "chunk": 0, "totalChunks": 1,
                 "completedQueries": 2, "expectedQueries": 2, "jobs": []}
        value.update(changes)
        return value

    def test_partial_failed_and_legacy_artifacts_are_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "chunk.json"
            for changes in [{"complete": False}, {"completedQueries": 1},
                            {"fullSearch": False}, {"trade": "holz"}, {"totalChunks": 5},
                            {"chunk": 1},
                            {"expectedQueries": 0}, {"scrapedAt": "invalid"},
                            {"scrapedAt": "2020-01-01T00:00:00Z"}]:
                path.write_text(json.dumps(self.artifact(**changes)))
                with self.assertRaises(publisher.PipelineError):
                    publisher.observation_time([path])
            path.write_text(json.dumps(self.artifact()))
            self.assertIsInstance(publisher.observation_time([path]), str)

    def test_duplicate_chunks_cannot_masquerade_as_a_complete_search(self):
        with tempfile.TemporaryDirectory() as directory:
            paths = [Path(directory) / f"chunk-{i}.json" for i in range(2)]
            for path in paths:
                path.write_text(json.dumps(self.artifact(totalChunks=2, chunk=0)))
            with self.assertRaises(publisher.PipelineError):
                publisher.observation_time(paths)

    def test_company_identity_preserves_legal_form_and_ignores_tracking_urls(self):
        job = {"company": "Müller & Söhne A.G.", "title": "Elektro Installateur", "location": "Zürich, ZH"}
        self.assertEqual(publisher.source_identity(job), "müllersöhneag|elektroinstallateur|zürich")
        self.assertEqual(publisher.source_identity({**job, "jobUrl": "https://example.test/new"}),
                         publisher.source_identity(job))
        self.assertNotEqual(publisher.source_identity({**job, "company": "Müller & Söhne GmbH"}),
                            publisher.source_identity(job))

    def test_failed_publication_never_records_a_completed_scrape(self):
        class Client:
            recorded = []
            def table(self, name): return self
            def upsert(self, *args, **kwargs): return self
            def update(self, *args, **kwargs): return self
            def eq(self, *args): return self
            def select(self, *args): return self
            def execute(self): return types.SimpleNamespace(data=[{"id": 1}])
            def rpc(self, name, values):
                self.recorded.append((name, values))
                return self
        client = Client()
        job = {"id": "scraped-elektro-fixture", "company": "Muster AG", "title": "Elektriker",
               "location": "Zürich", "datePosted": datetime.now(timezone.utc).date().isoformat()}
        with patch.object(publisher, "fetch_existing_jobs", return_value={}), \
             patch.object(publisher, "verify_publish", side_effect=publisher.PipelineError("failed")):
            with self.assertRaises(publisher.PipelineError):
                publisher.publish(client, [job], 35, 1, .5, self.artifact()["scrapedAt"])
        self.assertEqual(client.recorded, [])


if __name__ == "__main__":
    unittest.main()
