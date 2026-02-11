#!/usr/bin/env python3
"""local_db_tool.py

Simple CLI to manage a local JSON DB that mirrors the app's `localDb`.

Usage examples:
  ./scripts/local_db_tool.py init
  ./scripts/local_db_tool.py list users
  ./scripts/local_db_tool.py add-user --email foo@bar --password secret --name Foo
  ./scripts/local_db_tool.py upsert-profile --user-id user_xxx --name "Alice"
  ./scripts/local_db_tool.py add-message --conversation-id convo_x --sender-id user_x --content "hi"

The script reads/writes `local_db.json` in the repository root by default.
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict

ROOT = Path(__file__).resolve().parents[1]
DB_FILE = ROOT / "local_db.json"


def now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"


def generate_id(prefix: str) -> str:
    import random
    return f"{prefix}_{random.getrandbits(48):x}_{int(datetime.utcnow().timestamp()):x}"


def get_initial_db() -> Dict[str, Any]:
    return {
        "users": [],
        "profiles": [],
        "matches": [],
        "conversations": [],
        "messages": [],
    }


def load_db(path: Path = DB_FILE) -> Dict[str, Any]:
    if not path.exists():
        return get_initial_db()
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_db(db: Dict[str, Any], path: Path = DB_FILE) -> None:
    with path.open("w", encoding="utf-8") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)


def cmd_init(args: argparse.Namespace) -> None:
    if DB_FILE.exists() and not args.force:
        print(f"{DB_FILE} already exists. Use --force to overwrite.")
        return
    save_db(get_initial_db())
    print(f"Initialized {DB_FILE}")


def cmd_show(args: argparse.Namespace) -> None:
    db = load_db()
    print(json.dumps(db, indent=2, ensure_ascii=False))


def cmd_list(args: argparse.Namespace) -> None:
    db = load_db()
    key = args.collection
    if key not in db:
        print(f"Unknown collection: {key}")
        return
    print(json.dumps(db[key], indent=2, ensure_ascii=False))


def cmd_add_user(args: argparse.Namespace) -> None:
    db = load_db()
    email = args.email.lower()
    if any(u.get("email", "").lower() == email for u in db["users"]):
        print("User with that email already exists")
        return
    user = {
        "id": generate_id("user"),
        "email": email,
        "name": args.name or "",
        "password": args.password,
    }
    db["users"].append(user)
    save_db(db)
    print(f"Added user {user['id']}")


def cmd_upsert_profile(args: argparse.Namespace) -> None:
    db = load_db()
    user_id = args.user_id
    now = now_iso()
    existing = next((p for p in db["profiles"] if p.get("user_id") == user_id), None)
    partial = {k: v for k, v in [("name", args.name), ("college", args.college), ("branch", args.branch), ("year", args.year), ("bio", args.bio)] if v is not None}
    if not existing:
        profile = {
            "id": generate_id("profile"),
            "user_id": user_id,
            "name": partial.get("name", ""),
            "college": partial.get("college", ""),
            "branch": partial.get("branch", ""),
            "year": partial.get("year", ""),
            "bio": partial.get("bio", ""),
            "avatar_url": None,
            "is_profile_complete": False,
            "created_at": now,
            "updated_at": now,
        }
        db["profiles"].append(profile)
        save_db(db)
        print(f"Created profile {profile['id']}")
    else:
        existing.update(partial)
        existing["updated_at"] = now
        save_db(db)
        print(f"Updated profile {existing['id']}")


def cmd_ensure_convo(args: argparse.Namespace) -> None:
    db = load_db()
    match_id = args.match_id
    existing = next((c for c in db["conversations"] if c.get("match_id") == match_id), None)
    if existing:
        print(json.dumps(existing, indent=2))
        return
    convo = {"id": generate_id("convo"), "match_id": match_id, "created_at": now_iso()}
    db["conversations"].append(convo)
    save_db(db)
    print(f"Created conversation {convo['id']}")


def cmd_add_message(args: argparse.Namespace) -> None:
    db = load_db()
    msg = {
        "id": generate_id("msg"),
        "conversation_id": args.conversation_id,
        "sender_id": args.sender_id,
        "content": args.content,
        "is_read": False,
        "created_at": now_iso(),
    }
    db["messages"].append(msg)
    save_db(db)
    print(f"Added message {msg['id']}")


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Local DB management tool")
    sub = p.add_subparsers(dest="cmd")

    sub_init = sub.add_parser("init")
    sub_init.add_argument("--force", action="store_true")
    sub_init.set_defaults(func=cmd_init)

    sub_show = sub.add_parser("show")
    sub_show.set_defaults(func=cmd_show)

    sub_list = sub.add_parser("list")
    sub_list.add_argument("collection", choices=["users", "profiles", "matches", "conversations", "messages"]) 
    sub_list.set_defaults(func=cmd_list)

    sub_add_user = sub.add_parser("add-user")
    sub_add_user.add_argument("--email", required=True)
    sub_add_user.add_argument("--password", required=True)
    sub_add_user.add_argument("--name")
    sub_add_user.set_defaults(func=cmd_add_user)

    sub_upsert = sub.add_parser("upsert-profile")
    sub_upsert.add_argument("--user-id", required=True)
    sub_upsert.add_argument("--name")
    sub_upsert.add_argument("--college")
    sub_upsert.add_argument("--branch")
    sub_upsert.add_argument("--year")
    sub_upsert.add_argument("--bio")
    sub_upsert.set_defaults(func=cmd_upsert_profile)

    sub_convo = sub.add_parser("ensure-convo")
    sub_convo.add_argument("--match-id", required=True)
    sub_convo.set_defaults(func=cmd_ensure_convo)

    sub_msg = sub.add_parser("add-message")
    sub_msg.add_argument("--conversation-id", required=True)
    sub_msg.add_argument("--sender-id", required=True)
    sub_msg.add_argument("--content", required=True)
    sub_msg.set_defaults(func=cmd_add_message)

    return p


def main(argv=None):
    p = build_parser()
    args = p.parse_args(argv)
    if not hasattr(args, "func"):
        p.print_help()
        return 1
    args.func(args)
    return 0


def interactive_menu():
    """Simple menu-driven UI for local DB operations."""
    def prompt(msg: str, required: bool = True) -> str:
        while True:
            try:
                v = input(msg).strip()
            except (EOFError, KeyboardInterrupt):
                print()
                return ""
            if v or not required:
                return v

    while True:
        print("\nLocal DB Tool — interactive menu")
        print("1) Init local_db.json")
        print("2) Show full DB")
        print("3) List collection (users/profiles/matches/conversations/messages)")
        print("4) Add user")
        print("5) Upsert profile")
        print("6) Ensure conversation for match")
        print("7) Add message")
        print("8) Exit")
        choice = prompt("Select an option: ")
        if choice == "1":
            force = prompt("Force overwrite if exists? (y/N): ", required=False).lower() == "y"
            cmd_init(argparse.Namespace(force=force))
        elif choice == "2":
            cmd_show(argparse.Namespace())
        elif choice == "3":
            col = prompt("Collection name: ")
            cmd_list(argparse.Namespace(collection=col))
        elif choice == "4":
            email = prompt("Email: ")
            password = prompt("Password: ")
            name = prompt("Name (optional): ", required=False)
            cmd_add_user(argparse.Namespace(email=email, password=password, name=name))
        elif choice == "5":
            user_id = prompt("User ID: ")
            name = prompt("Name (optional): ", required=False)
            college = prompt("College (optional): ", required=False)
            branch = prompt("Branch (optional): ", required=False)
            year = prompt("Year (optional): ", required=False)
            bio = prompt("Bio (optional): ", required=False)
            cmd_upsert_profile(argparse.Namespace(user_id=user_id, name=name, college=college, branch=branch, year=year, bio=bio))
        elif choice == "6":
            match_id = prompt("Match ID: ")
            cmd_ensure_convo(argparse.Namespace(match_id=match_id))
        elif choice == "7":
            convo_id = prompt("Conversation ID: ")
            sender_id = prompt("Sender ID: ")
            content = prompt("Content: ")
            cmd_add_message(argparse.Namespace(conversation_id=convo_id, sender_id=sender_id, content=content))
        elif choice == "8" or choice.lower() in ("q", "quit", "exit"):
            print("Exiting.")
            break
        else:
            print("Unknown option")


if __name__ == "__main__":
    # If no args provided, run interactive menu; otherwise use CLI parser
    if len(sys.argv) <= 1:
        try:
            interactive_menu()
        except KeyboardInterrupt:
            print("\nInterrupted. Exiting.")
            sys.exit(0)
    else:
        raise SystemExit(main())
