#!/usr/bin/env python3
"""
Script to add Legal Advisor agent to the database
Run this to register the legal advisor agent properly
"""
import sqlite3
import json
from datetime import datetime

def add_legal_advisor():
    conn = sqlite3.connect('/home/med/CascadeProjects/Kimi_Agent/backend/wakalat.db')
    c = conn.cursor()
    
    # Check if handle exists
    c.execute("SELECT id FROM handles WHERE handle = 'legal_advisor'")
    result = c.fetchone()
    
    if result:
        handle_id = result[0]
        print(f"✓ Handle 'legal_advisor' exists with ID: {handle_id}")
    else:
        c.execute("INSERT INTO handles (handle, email, created_at) VALUES (?, ?, ?)", 
                  ('legal_advisor', 'legal@example.com', datetime.now()))
        handle_id = c.lastrowid
        print(f"✓ Created handle 'legal_advisor' with ID: {handle_id}")
    
    # Check if profile exists
    c.execute("SELECT id, display_name FROM agent_profiles WHERE handle_id = ?", (handle_id,))
    profile = c.fetchone()
    
    if profile:
        print(f"✓ Profile exists: ID={profile[0]}, Name={profile[1]}")
    else:
        c.execute("""
            INSERT INTO agent_profiles 
            (handle_id, display_name, role, country, tags, bio, is_public, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            handle_id,
            'مستشار قانوني',
            'مستشار قانوني - استشارات للمحامين والطلاب والمواطنين',
            '🇪🇬 Cairo, EG',
            json.dumps(['Law', 'Legal', 'Consulting', 'Contracts', 'Rights', 'Court']),
            'مستشار قانوني متخصص في تقديم الاستشارات القانونية للمحامين، طلاب القانون، والمواطنين. خبير في العقود، الحقوق، والإجراءات القضائية',
            1,
            datetime.now()
        ))
        print(f"✓ Created profile with ID: {c.lastrowid}")
    
    conn.commit()
    
    # Verify and show agent ID
    c.execute("""
        SELECT p.id, h.handle, p.display_name, p.role 
        FROM handles h 
        JOIN agent_profiles p ON h.id = p.handle_id 
        WHERE h.handle = 'legal_advisor'
    """)
    row = c.fetchone()
    if row:
        print(f"\n✓✓✓ Legal Agent Ready:")
        print(f"  Database ID: {row[0]}")
        print(f"  Handle: @{row[1]}")
        print(f"  Name: {row[2]}")
        print(f"\nAccess URLs:")
        print(f"  - http://localhost:3000/legal/{row[0]}  (by ID)")
        print(f"  - http://localhost:3000/legal/{row[1]}  (by handle)")
        print(f"  - http://localhost:3000/agent/@{row[1]}")
    
    conn.close()
    print("\nDone! Refresh the page to see the legal advisor.")

if __name__ == '__main__':
    add_legal_advisor()
