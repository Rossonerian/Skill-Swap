#!/usr/bin/env python3
"""Simple local DB tool: show, list, get/add/update basic operations.

This minimal script intentionally avoids interactive menus and advanced
features; it is aimed at quick inspection and light updates of
`local_db.json` during development.
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


def load_db(path: Path = DB_FILE) -> Dict[str, Any]:
    if not path.exists():
        return {"users": [], "profiles": [], "matches": [], "conversations": [], "messages": []}
    with path.open("r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError as e:
            print(f"Error: {path} is not valid JSON: {e}")
            sys.exit(1)


def save_db(db: Dict[str, Any], path: Path = DB_FILE) -> None:
    tmp = path.with_suffix(path.suffix + ".tmp")
    with tmp.open("w", encoding="utf-8") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
        f.flush()
        os.fsync(f.fileno())
    tmp.replace(path)


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


def cmd_get_user(args: argparse.Namespace) -> None:
    db = load_db()
    if args.email:
        email = args.email.lower()
        user = next((u for u in db["users"] if u.get("email", "").lower() == email), None)
    elif args.user_id:
        user = next((u for u in db["users"] if u.get("id") == args.user_id), None)
    else:
        print("Provide --email or --user-id")
        return
    if not user:
        print("User not found")
        return
    print(json.dumps(user, indent=2, ensure_ascii=False))


def cmd_get_profile(args: argparse.Namespace) -> None:
    db = load_db()
    if args.user_id:
        profile = next((p for p in db["profiles"] if p.get("user_id") == args.user_id), None)
    elif args.profile_id:
        profile = next((p for p in db["profiles"] if p.get("id") == args.profile_id), None)
    else:
        print("Provide --user-id or --profile-id")
        return
    if not profile:
        print("Profile not found")
        return
    print(json.dumps(profile, indent=2, ensure_ascii=False))


def cmd_add_user(args: argparse.Namespace) -> None:
    db = load_db()
    email = args.email.lower()
    if any(u.get("email", "").lower() == email for u in db["users"]):
        print("User with that email already exists")
        return
    user = {"id": generate_id("user"), "email": email, "name": args.name or "", "password": args.password}
    db["users"].append(user)
    save_db(db)
    print(user["id"])


def cmd_upsert_profile(args: argparse.Namespace) -> None:
    db = load_db()
    user_id = args.user_id
    now = now_iso()
    existing = next((p for p in db["profiles"] if p.get("user_id") == user_id), None)
    partial = {k: v for k, v in [("name", args.name), ("college", args.college), ("branch", args.branch), ("year", args.year), ("bio", args.bio)] if v is not None}
    if not existing:
        profile = {"id": generate_id("profile"), "user_id": user_id, "name": partial.get("name", ""), "college": partial.get("college", ""), "branch": partial.get("branch", ""), "year": partial.get("year", ""), "bio": partial.get("bio", ""), "avatar_url": None, "is_profile_complete": False, "created_at": now, "updated_at": now}
        db["profiles"].append(profile)
        save_db(db)
        print(profile["id"])
    else:
        existing.update(partial)
        existing["updated_at"] = now
        save_db(db)
        print(existing["id"])


def cmd_add_message(args: argparse.Namespace) -> None:
    db = load_db()
    msg = {"id": generate_id("msg"), "conversation_id": args.conversation_id, "sender_id": args.sender_id, "content": args.content, "is_read": False, "created_at": now_iso()}
    db["messages"].append(msg)
    save_db(db)
    print(msg["id"])


def cmd_set_db(args: argparse.Namespace) -> None:
    # replace DB from a file or stdin
    if args.file:
        p = Path(args.file)
        if not p.exists():
            print(f"File not found: {p}")
            return
        with p.open("r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        data = json.load(sys.stdin)
    # basic shape check
    if not isinstance(data, dict):
        print("DB must be a JSON object")
        return
    save_db(data)
    print("OK")


def cmd_seed(args: argparse.Namespace) -> None:
    """Seed the DB with random dummy data for development testing."""
    import random

    db = load_db()
    num_users = int(args.users or 5)
    sample_names = [
        "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Sam",
        "Jamie", "Robin", "Avery", "Chris", "Pat", "Dana", "Lee",
    ]
    colleges = ["MIT", "Stanford", "UCLA", "Oxford", "Cambridge", "State U"]
    branches = ["Computer Science", "Mathematics", "Physics", "Engineering", "Art", None]
    skills = ["Guitar", "French", "Cooking", "Photography", "Data Science", "Public Speaking"]

    created_users = []
    for i in range(num_users):
        name = random.choice(sample_names) + (" " + random.choice(["Smith", "Chen", "Patel", "Garcia"]) if random.random() < 0.6 else "")
        email = f"{name.split()[0].lower()}{random.randint(1,999)}@example.com"
        user = {"id": generate_id("user"), "email": email, "name": name, "password": "secret"}
        db["users"].append(user)
        created_users.append(user)

        prof = {
            "id": generate_id("profile"),
            "user_id": user["id"],
            "name": name,
            "college": random.choice(colleges),
            "branch": random.choice(branches),
            "year": str(random.randint(1,4)),
            "bio": f"Hi, I'm {name.split()[0]} and I like {random.choice(skills)}.",
            "avatar_url": None,
            "is_profile_complete": True,
            "created_at": now_iso(),
            "updated_at": now_iso(),
        }
        db["profiles"].append(prof)

    # create some matches between users
    possible_pairs = []
    for i in range(len(created_users)):
        for j in range(i + 1, len(created_users)):
            possible_pairs.append((created_users[i], created_users[j]))
    random.shuffle(possible_pairs)

    match_types = ["perfect", "strong", "good", "potential"]
    created_matches = []
    for a, b in possible_pairs[: max(1, len(created_users))]:
        score = random.randint(30, 100)
        mtype = random.choice(match_types)
        match = {
            "id": generate_id("match"),
            "user1_id": a["id"],
            "user2_id": b["id"],
            "match_score": score,
            "match_type": mtype,
            "match_reasons": [f"Random reason {random.randint(1,5)}"],
            "match_mutual_skills": [],
            "match_one_way_for_user": [],
            "match_one_way_from_user": [],
            "status": random.choice(["pending", "accepted", "rejected"]),
            "created_at": now_iso(),
        }
        db["matches"].append(match)
        created_matches.append(match)

        # create a conversation for accepted matches
        if match["status"] == "accepted":
            convo = {"id": generate_id("convo"), "match_id": match["id"], "created_at": now_iso()}
            db["conversations"].append(convo)
            # add a couple messages
            for t in range(random.randint(1, 3)):
                sender = random.choice([a, b])
                msg = {
                    "id": generate_id("msg"),
                    "conversation_id": convo["id"],
                    "sender_id": sender["id"],
                    "content": random.choice(["Hi!", "Hello", "Would you like to meet?", "Let's schedule a time."]),
                    "is_read": False,
                    "created_at": now_iso(),
                }
                db["messages"].append(msg)

    save_db(db)
    print(f"Seeded {len(created_users)} users, {len(created_matches)} matches")


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Simple local DB viewer/updater")
    sub = p.add_subparsers(dest="cmd")
    sub_show = sub.add_parser("show"); sub_show.set_defaults(func=cmd_show)
    sub_list = sub.add_parser("list"); sub_list.add_argument("collection", choices=["users", "profiles", "matches", "conversations", "messages"]); sub_list.set_defaults(func=cmd_list)
    sub_get_user = sub.add_parser("get-user"); sub_get_user.add_argument("--email"); sub_get_user.add_argument("--user-id"); sub_get_user.set_defaults(func=cmd_get_user)
    sub_get_profile = sub.add_parser("get-profile"); sub_get_profile.add_argument("--user-id"); sub_get_profile.add_argument("--profile-id"); sub_get_profile.set_defaults(func=cmd_get_profile)
    sub_add_user = sub.add_parser("add-user"); sub_add_user.add_argument("--email", required=True); sub_add_user.add_argument("--password", required=True); sub_add_user.add_argument("--name"); sub_add_user.set_defaults(func=cmd_add_user)
    sub_upsert = sub.add_parser("upsert-profile"); sub_upsert.add_argument("--user-id", required=True); sub_upsert.add_argument("--name"); sub_upsert.add_argument("--college"); sub_upsert.add_argument("--branch"); sub_upsert.add_argument("--year"); sub_upsert.add_argument("--bio"); sub_upsert.set_defaults(func=cmd_upsert_profile)
    sub_msg = sub.add_parser("add-message"); sub_msg.add_argument("--conversation-id", required=True); sub_msg.add_argument("--sender-id", required=True); sub_msg.add_argument("--content", required=True); sub_msg.set_defaults(func=cmd_add_message)
    sub_set = sub.add_parser("set-db"); sub_set.add_argument("--file", help="JSON file to replace DB with (defaults to stdin)"); sub_set.set_defaults(func=cmd_set_db)
    sub_seed = sub.add_parser("seed"); sub_seed.add_argument("--users", help="Number of random users to create (default 5)"); sub_seed.set_defaults(func=cmd_seed)
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
        print("\nLocal DB Tool — menu")
        print("1) Show full DB")
        print("2) List collection")
        print("3) Get user")
        print("4) Get profile")
        print("5) Add user")
        print("6) Upsert profile")
        print("7) Add message")
        print("8) Replace DB from file/stdin (set-db)")
        print("9) Exit")
        choice = prompt("Select an option: ")
        if choice == "1":
            cmd_show(argparse.Namespace())
        elif choice == "2":
            col = prompt("Collection (users/profiles/matches/conversations/messages): ")
            cmd_list(argparse.Namespace(collection=col))
        elif choice == "3":
            email = prompt("Email (leave empty to use user-id): ", required=False)
            if email:
                cmd_get_user(argparse.Namespace(email=email, user_id=None))
            else:
                uid = prompt("User ID: ")
                cmd_get_user(argparse.Namespace(email=None, user_id=uid))
        elif choice == "4":
            uid = prompt("User ID (leave empty to use profile-id): ", required=False)
            if uid:
                cmd_get_profile(argparse.Namespace(user_id=uid, profile_id=None))
            else:
                pid = prompt("Profile ID: ")
                cmd_get_profile(argparse.Namespace(user_id=None, profile_id=pid))
        elif choice == "5":
            email = prompt("Email: ")
            password = prompt("Password: ")
            name = prompt("Name (optional): ", required=False)
            cmd_add_user(argparse.Namespace(email=email, password=password, name=name))
        elif choice == "6":
            uid = prompt("User ID: ")
            name = prompt("Name (optional): ", required=False)
            college = prompt("College (optional): ", required=False)
            branch = prompt("Branch (optional): ", required=False)
            year = prompt("Year (optional): ", required=False)
            bio = prompt("Bio (optional): ", required=False)
            cmd_upsert_profile(argparse.Namespace(user_id=uid, name=name, college=college, branch=branch, year=year, bio=bio))
        elif choice == "7":
            convo = prompt("Conversation ID: ")
            sender = prompt("Sender ID: ")
            content = prompt("Content: ")
            cmd_add_message(argparse.Namespace(conversation_id=convo, sender_id=sender, content=content))
        elif choice == "8":
            path = prompt("File path (leave empty to read from stdin): ", required=False)
            if path:
                cmd_set_db(argparse.Namespace(file=path))
            else:
                print("Paste JSON then Ctrl-D:")
                try:
                    cmd_set_db(argparse.Namespace(file=None))
                except Exception:
                    pass
        elif choice == "9" or choice.lower() in ("q", "quit", "exit"):
            print("Exiting.")
            break
        else:
            print("Unknown option")


if __name__ == "__main__":
    # If no args provided, launch interactive menu
    if len(sys.argv) <= 1:
        try:
            interactive_menu()
        except KeyboardInterrupt:
            print("\nInterrupted. Exiting.")
            sys.exit(0)
        sys.exit(0)
    raise SystemExit(main())


if __name__ == "__main__":
    raise SystemExit(main())
