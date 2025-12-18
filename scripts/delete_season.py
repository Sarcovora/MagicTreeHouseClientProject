

"""
Minimal helper for calling DELETE /api/seasons/:seasonId without third-party deps.

Example:
    python scripts/delete_season.py 98-99
    python scripts/delete_season.py --season 24-25 --base-url http://localhost:3000
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request
from typing import Optional


def delete_season(base_url: str, season_id: str) -> tuple[int, Optional[dict]]:
    """Perform the DELETE request and return (status_code, parsed_json_or_none)."""
    url = f"{base_url.rstrip('/')}/api/seasons/{season_id}"
    req = urllib.request.Request(url, method="DELETE")
    req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req, timeout=30) as response:  # nosec B310
            status = response.getcode()
            raw = response.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as http_err:
        status = http_err.code
        raw = http_err.read().decode("utf-8", errors="replace")
    except urllib.error.URLError as err:
        raise RuntimeError(f"Request failed: {err}") from err

    payload = None
    if raw:
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            payload = {"raw": raw}

    return status, payload


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Test the backend season delete endpoint.")
    parser.add_argument(
        "season",
        nargs="?",
        help="Season identifier to delete (e.g. 98-99). Prompts if omitted.",
    )
    parser.add_argument(
        "--base-url",
        default="http://localhost:3000",
        help="Backend base URL (default: http://localhost:3000)",
    )
    return parser.parse_args(argv)


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    season = args.season or input("Enter season to delete (e.g. 98-99): ").strip()
    if not season:
        print("No season provided; aborting.")
        return 1

    print(f"→ DELETE {args.base_url.rstrip('/')}/api/seasons/{season}")

    try:
        status, payload = delete_season(args.base_url, season)
    except RuntimeError as err:
        print(err)
        return 1

    print(f"← Status {status}")
    if payload is not None:
        print("Payload:", json.dumps(payload, indent=2))

    return 0 if 200 <= status < 300 else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
