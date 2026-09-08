"""Regression checks for stated source fields; no network or database access."""
import importlib.util
import sys
import types
import unittest
from datetime import date
from pathlib import Path


def load_script(name, filename):
    spec = importlib.util.spec_from_file_location(name, Path(__file__).with_name(filename))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


# Jobspy is only needed to scrape. These checks never call its network function.
sys.modules.setdefault("jobspy", types.SimpleNamespace(scrape_jobs=None))
scraper = load_script("scraper", "scrape-jobs.py")
publisher = load_script("publisher", "publish-jobs.py")


class SourceFieldTests(unittest.TestCase):
    def test_workload_preserves_ranges(self):
        for source in ["Pensum: 80-100%", "Pensum: 80–100%", "Pensum: 80 % — 100 %"]:
            self.assertEqual(scraper.extract_workload(source), "80-100%")
        self.assertEqual(scraper.extract_workload("Arbeitspensum: 50%"), "50%")

    def test_workload_rejects_inverted_ranges_and_unrelated_single_percentages(self):
        for source in ["Pensum: 100-80%", "Pensum: 120%", "Pensum: 0%", "20% Mitarbeiterrabatt", "Vollzeit"]:
            self.assertIsNone(scraper.extract_workload(source))

    def test_missing_fields_remain_unknown_through_scraping_and_publication(self):
        job = scraper.normalize_job({
            "title": "Elektroinstallateur/in", "job_url": "https://example.test/job/1",
            "location": "Winterthur, ZH, CH", "date_posted": date.today().isoformat(),
            "description": "Gesucht wird eine Elektrofachkraft für Installationen und Wartungsarbeiten.",
        }, 0)
        self.assertIsNotNone(job)
        self.assertEqual(job["type"], "")
        self.assertEqual(job["workload"], "")
        row = publisher.to_db_row(job, date.today())
        self.assertEqual(row["type"], "")
        self.assertEqual(row["workload"], "")

    def test_explicit_source_fields_survive(self):
        job = scraper.normalize_job({
            "title": "Elektroinstallateur/in", "job_url": "https://example.test/job/2",
            "location": "Winterthur, ZH, CH", "date_posted": date.today().isoformat(),
            "job_type": "parttime", "description": "Pensum: 80–100%. Elektroinstallationen und Wartung.",
        }, 0)
        self.assertEqual(job["type"], "Teilzeit")
        self.assertEqual(job["workload"], "80-100%")


if __name__ == "__main__":
    unittest.main()
