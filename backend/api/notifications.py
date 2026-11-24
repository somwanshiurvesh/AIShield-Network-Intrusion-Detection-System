from fastapi import APIRouter, HTTPException, Path
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import random
from pydantic import BaseModel
import pandas as pd
from pathlib import Path as FilePath

# Define router
notifications_router = APIRouter()

# In-memory storage for notifications (in a real app, this would be a database)
notifications_db = []
last_notification_id = 0

# Generate sample notifications based on actual NSL-KDD data
def generate_notifications_from_data(num_notifications=10):
    global last_notification_id
    
    try:
        # Try to find CSV files or NSL-KDD dataset
        base_dir = FilePath(".")
        csv_files = [
            FilePath("normal_traffic.csv"),
            FilePath("dos_attacks.csv"),
            FilePath("probe_attacks.csv"),
            FilePath("r2l_attacks.csv"),
            FilePath("u2r_attacks.csv"),
        ]
        
        # Check if we have NSL-KDD dataset
        nsl_kdd_files = [
            FilePath("NSL KDD/KDDTrain+_20Percent.txt"),
            FilePath("NSL KDD/KDDTest+.txt"),
            FilePath("../NSL KDD/KDDTrain+_20Percent.txt"),
            FilePath("../NSL KDD/KDDTest+.txt"),
        ]
        
        # First check for NSL-KDD data
        use_nsl_data = False
        nsl_file = None
        for file in nsl_kdd_files:
            if file.exists():
                nsl_file = file
                use_nsl_data = True
                break
        
        attack_types = []
        if use_nsl_data:
            # NSL-KDD dataset
            col_names = [
                'duration', 'protocol_type', 'service', 'flag', 'src_bytes', 'dst_bytes',
                'land', 'wrong_fragment', 'urgent', 'hot', 'num_failed_logins', 'logged_in',
                'num_compromised', 'root_shell', 'su_attempted', 'num_root', 'num_file_creations',
                'num_shells', 'num_access_files', 'num_outbound_cmds', 'is_host_login',
                'is_guest_login', 'count', 'srv_count', 'serror_rate', 'srv_serror_rate',
                'rerror_rate', 'srv_rerror_rate', 'same_srv_rate', 'diff_srv_rate',
                'srv_diff_host_rate', 'dst_host_count', 'dst_host_srv_count',
                'dst_host_same_srv_rate', 'dst_host_diff_srv_rate', 'dst_host_same_src_port_rate',
                'dst_host_srv_diff_host_rate', 'dst_host_serror_rate', 'dst_host_srv_serror_rate',
                'dst_host_rerror_rate', 'dst_host_srv_rerror_rate', 'class', 'difficulty'
            ]
            
            # Read a small sample of the dataset
            df = pd.read_csv(nsl_file, header=None, names=col_names, nrows=1000)
            
            # Map attack classes to general categories
            def get_attack_type(attack_class):
                if attack_class == 'normal':
                    return 'Normal'
                elif attack_class in ['back', 'land', 'neptune', 'pod', 'smurf', 'teardrop', 'apache2', 'udpstorm', 'processtable', 'worm']:
                    return 'DoS'
                elif attack_class in ['satan', 'ipsweep', 'nmap', 'portsweep', 'mscan', 'saint']:
                    return 'Probe'
                elif attack_class in ['guess_passwd', 'ftp_write', 'imap', 'phf', 'multihop', 'warezmaster', 'warezclient', 'spy', 'xlock', 'xsnoop', 'snmpguess', 'snmpgetattack', 'httptunnel', 'sendmail', 'named']:
                    return 'R2L'
                elif attack_class in ['buffer_overflow', 'loadmodule', 'rootkit', 'perl', 'sqlattack', 'xterm', 'ps']:
                    return 'U2R'
                else:
                    return 'Unknown'
            
            # Get attack classes and types for notifications
            attack_classes = df[df['class'] != 'normal']['class'].sample(min(num_notifications, len(df[df['class'] != 'normal']))).tolist()
            attack_types = [get_attack_type(cls) for cls in attack_classes]
            
            # If we don't have enough attack samples, fill with generic ones
            while len(attack_types) < num_notifications:
                attack_types.append(random.choice(['DoS', 'Probe', 'R2L', 'U2R']))
        
        else:
            # Try CSV files
            for file in csv_files:
                if file.exists() and 'normal' not in file.stem:
                    # Extract attack type from filename
                    attack_type = file.stem
                    if 'dos' in attack_type:
                        attack_types.append('DoS')
                    elif 'probe' in attack_type:
                        attack_types.append('Probe')
                    elif 'r2l' in attack_type:
                        attack_types.append('R2L')
                    elif 'u2r' in attack_type:
                        attack_types.append('U2R')
            
            # If we don't have enough attack types, fill with generic ones
            while len(attack_types) < num_notifications:
                attack_types.append(random.choice(['DoS', 'Probe', 'R2L', 'U2R']))
        
        # Generate notifications based on attack types
        notifications = []
        now = datetime.now()
        
        for i, attack_type in enumerate(attack_types[:num_notifications]):
            # Generate a notification based on attack type
            notification_type = "info"
            message = "System notification"
            
            if attack_type == 'DoS':
                notification_type = "danger"
                message = random.choice([
                    "DoS attack attempt blocked",
                    "SYN flood detected from 192.168.1.45",
                    "Unusual traffic spike detected - possible DoS",
                    "Resource exhaustion attempt identified"
                ])
            elif attack_type == 'Probe':
                notification_type = "warning"
                message = random.choice([
                    "Port scanning activity detected",
                    "Network mapping attempt identified",
                    "Suspicious reconnaissance detected",
                    "Vulnerability scanning in progress"
                ])
            elif attack_type == 'R2L':
                notification_type = "danger"
                message = random.choice([
                    "Unauthorized access attempt blocked",
                    "Brute force login attack detected",
                    "Password attack against SSH service",
                    "FTP server illegal access attempt"
                ])
            elif attack_type == 'U2R':
                notification_type = "danger"
                message = random.choice([
                    "Privilege escalation attempt detected",
                    "Buffer overflow attack blocked",
                    "Root access attempt from unauthorized user",
                    "Suspicious system process execution"
                ])
            else:
                notification_type = "info"
                message = "System scan completed successfully"
            
            # Generate random time within the past 24 hours
            hours_ago = random.randint(0, 23)
            minutes_ago = random.randint(0, 59)
            time_ago = now - timedelta(hours=hours_ago, minutes=minutes_ago)
            
            # Format as relative time for display
            if hours_ago == 0:
                if minutes_ago == 0:
                    time_str = "Just now"
                else:
                    time_str = f"{minutes_ago} minute{'s' if minutes_ago != 1 else ''} ago"
            else:
                time_str = f"{hours_ago} hour{'s' if hours_ago != 1 else ''} ago"
            
            # Create notification
            last_notification_id += 1
            notifications.append({
                "id": last_notification_id,
                "type": notification_type,
                "message": message,
                "time": time_str,
                "timestamp": time_ago.isoformat(),
                "read": False
            })
        
        return notifications
    
    except Exception as e:
        print(f"Error generating notifications: {str(e)}")
        # Fallback to generic notifications
        return [
            {
                "id": 1,
                "type": "warning",
                "message": "Unusual network activity detected",
                "time": "10 minutes ago",
                "timestamp": (datetime.now() - timedelta(minutes=10)).isoformat(),
                "read": False
            },
            {
                "id": 2,
                "type": "danger",
                "message": "DoS attack attempt blocked",
                "time": "1 hour ago",
                "timestamp": (datetime.now() - timedelta(hours=1)).isoformat(),
                "read": False
            },
            {
                "id": 3,
                "type": "info",
                "message": "System scan completed successfully",
                "time": "3 hours ago",
                "timestamp": (datetime.now() - timedelta(hours=3)).isoformat(),
                "read": True
            }
        ]

# Initialize with some notifications
if not notifications_db:
    notifications_db = generate_notifications_from_data(10)

# Get all notifications
@notifications_router.get("")
async def get_notifications():
    """
    Get all notifications
    """
    try:
        # Sort by timestamp (newest first)
        sorted_notifications = sorted(
            notifications_db, 
            key=lambda x: datetime.fromisoformat(x["timestamp"]) if "timestamp" in x else datetime.now(),
            reverse=True
        )
        return sorted_notifications
    except Exception as e:
        print(f"Error getting notifications: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Mark a notification as read
@notifications_router.put("/{notification_id}/read")
async def mark_notification_as_read(notification_id: int = Path(..., description="The ID of the notification to mark as read")):
    """
    Mark a notification as read
    """
    try:
        for notification in notifications_db:
            if notification["id"] == notification_id:
                notification["read"] = True
                return {"message": "Notification marked as read"}
        
        raise HTTPException(status_code=404, detail="Notification not found")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        print(f"Error marking notification as read: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Mark all notifications as read
@notifications_router.put("/read-all")
async def mark_all_notifications_as_read():
    """
    Mark all notifications as read
    """
    try:
        for notification in notifications_db:
            notification["read"] = True
        return {"message": "All notifications marked as read"}
    except Exception as e:
        print(f"Error marking all notifications as read: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Clear all notifications
@notifications_router.delete("/clear-all")
async def clear_all_notifications():
    """
    Clear all notifications
    """
    try:
        global notifications_db
        notifications_db = []
        return {"message": "All notifications cleared"}
    except Exception as e:
        print(f"Error clearing notifications: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 