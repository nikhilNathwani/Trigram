#!/usr/bin/env python3
"""
Import trigram labels from Google Sheet CSV export into Firebase Firestore.

Usage:
    python import_google_sheet_labels.py [csv_path]

    csv_path defaults to the exported sheet at:
        tools/trigram_filtering.xlsx - Sheet1.csv

Requirements:
    pip install firebase-admin

Setup (one-time):
    1. Go to Firebase Console → Project Settings → Service accounts
    2. Click "Generate new private key" → download the JSON
    3. Save it as:  tools/scripts/serviceAccount.json
       (this file is in .gitignore — never commit it)
    4. Run this script

What it does:
    - Reads the CSV, normalizes status capitalization (yes→YES, maybe→MAYBE, no→NO)
    - Skips rows with empty status or status=DONE (DONE comes from trigram_calendar.json)
    - Uploads each label to Firestore collection "trigrams", doc ID = uppercase trigram
    - Fields: { label, comment, labeledAt }
    - Safe to re-run: existing docs are overwritten with the same data
"""

import csv
import sys
import os
from datetime import datetime, timezone


def normalize_label(raw):
    s = raw.strip().upper()
    if s in ('YES', 'NO', 'MAYBE'):
        return s
    return None


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))

    csv_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        script_dir, '..', 'trigram_filtering.xlsx - Sheet1.csv'
    )
    csv_path = os.path.abspath(csv_path)

    sa_path = os.path.join(script_dir, 'serviceAccount.json')

    if not os.path.exists(sa_path):
        print(f"\n❌  Service account file not found:\n    {sa_path}")
        print("\n   Download it from:")
        print("   Firebase Console → Project Settings → Service accounts → Generate new private key")
        sys.exit(1)

    if not os.path.exists(csv_path):
        print(f"\n❌  CSV file not found:\n    {csv_path}")
        sys.exit(1)

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
    except ImportError:
        print("\n❌  firebase-admin not installed. Run:  pip install firebase-admin")
        sys.exit(1)

    cred = credentials.Certificate(sa_path)
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    now = datetime.now(timezone.utc)
    imported = 0
    skipped_done = 0
    skipped_empty = 0
    skipped_unknown = 0

    print(f"\nReading: {csv_path}")
    print("=" * 60)

    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.reader(f)
        next(reader, None)  # skip header row

        for row in reader:
            if not row or not row[0].strip():
                continue

            trigram = row[0].strip().upper()
            if len(trigram) != 3 or not trigram.isalpha():
                continue

            raw_status = row[1].strip() if len(row) > 1 else ''
            comment = row[2].strip() if len(row) > 2 else ''

            if not raw_status:
                skipped_empty += 1
                continue

            if raw_status.upper() == 'DONE':
                skipped_done += 1
                continue

            label = normalize_label(raw_status)
            if not label:
                print(f"  ⚠️   Unrecognized status '{raw_status}' for {trigram} — skipping")
                skipped_unknown += 1
                continue

            db.collection('trigrams').document(trigram).set({
                'label': label,
                'comment': comment,
                'labeledAt': now,
            })
            print(f"  ✅  {trigram}  {label:<5}  {comment}")
            imported += 1

    print("=" * 60)
    print(f"Imported:          {imported}")
    print(f"Skipped (DONE):    {skipped_done}")
    print(f"Skipped (empty):   {skipped_empty}")
    if skipped_unknown:
        print(f"Skipped (unknown): {skipped_unknown}")


if __name__ == '__main__':
    main()
