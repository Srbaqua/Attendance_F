#!/usr/bin/env python3
"""
CLI wrapper for FaceRecognitionService to be called from Node.js
"""
import sys
import json
import cv2
import os
import numpy as np
import sys
from server import FaceRecognitionService

def main():
    # Check arguments
    if len(sys.argv) < 3:
        print(json.dumps({
            "success": False,
            "message": "Usage: python face_service_cli.py <method> <image_path> [student_id]"
        }))
        sys.exit(1)

    method = sys.argv[1]
    image_path = sys.argv[2]
    student_id = sys.argv[3] if len(sys.argv) > 3 else None

    # Check if file exists
    if not os.path.exists(image_path):
        print(json.dumps({
            "success": False,
            "message": f"Image file not found: {image_path}"
        }))
        sys.exit(1)

    # Read image
    try:
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError("Failed to read image")
    except Exception as e:
        print(json.dumps({
            "success": False,
            "message": f"Error reading image: {str(e)}"
        }))
        sys.exit(1)

    # Initialize face recognition service
    fr_service = FaceRecognitionService()

    # Process based on method
    if method == "register":
        if not student_id:
            print(json.dumps({
                "success": False,
                "message": "Student ID is required for registration"
            }))
            sys.exit(1)

        success, message = fr_service.register_face(image, student_id)
        print(json.dumps({
            "success": success,
            "message": message
        }))
    
    elif method == "recognize":
        student_id, result = fr_service.recognize_face(image)
        
        if isinstance(result, float):  # If result is confidence value
            print(json.dumps({
                "success": True,
                "student_id": student_id,
                "confidence": float(result)  # Convert numpy float to Python float if needed
            }))
        else:  # If result is error message
            print(json.dumps({
                "success": False,
                "message": result
            }))
    
    else:
        print(json.dumps({
            "success": False,
            "message": f"Unknown method: {method}"
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()