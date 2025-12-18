import base64
import os
import sys
import requests


def read_file_as_base64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def main():
    if len(sys.argv) < 3:
        print("Usage: python test_upload.py <project_record_id> <file_path> [document_type]")
        print("Example: python test_upload.py rec123abc ./sample.jpg carbonDocs")
        sys.exit(1)

    project_id = sys.argv[1]
    file_path = sys.argv[2]
    document_type = sys.argv[3] if len(sys.argv) > 3 else "carbonDocs"

    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        sys.exit(1)

    api_base = os.getenv("API_BASE", "http://localhost:3000/api")

    payload = {
        "documentType": document_type,
        "filename": os.path.basename(file_path),
        "contentType": "application/octet-stream",
        "data": read_file_as_base64(file_path),
    }

    url = f"{api_base}/projects/{project_id}/documents"
    print(f"Uploading {file_path} to {url} as {document_type} ...")
    resp = requests.post(url, json=payload, timeout=30)
    print(f"Status: {resp.status_code}")
    try:
        print(resp.json())
    except Exception:
        print(resp.text)


if __name__ == "__main__":
    main()
