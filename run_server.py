#!/usr/bin/env python3
import os
import sys
from app import app, socketio

if __name__ == '__main__':
    # Create uploads directory if it doesn't exist
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    
    print("Starting Flask server with Socket.IO...")
    print("Backend will be available at: http://localhost:5000")
    print("Press Ctrl+C to stop the server")
    
    try:
        socketio.run(app, debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)
