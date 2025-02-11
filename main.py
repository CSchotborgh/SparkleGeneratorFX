from app import app
import argparse

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=3000)
    args = parser.parse_args()

    app.run(host="0.0.0.0", port=args.port, debug=True)