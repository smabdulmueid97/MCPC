📦 Courier and Parcel Management System (CPMC)
    A full-featured MERN stack logistics platform allowing customers to book parcel pickups, admins to manage deliveries, and agents to fulfill deliveries in real-time. Includes role-based access, real-time tracking, geolocation, and report generation.

👤 Roles Supported
    Admin: Manage parcels, assign agents, monitor metrics, export reports.
    Customer: Book parcels, view history, track real-time status.
    Delivery Agent: View assigned deliveries, update statuses, view optimized delivery routes.

🔧 Tech 
    Frontend	React.js, Tailwind CSS, Socket.IO, Google Maps API
    Backend	    Node.js, Express.js, MongoDB, JWT
    Realtime	Socket.IO

🧑‍💼 Admin
    View daily bookings, failed deliveries, and COD totals
    Assign agents to parcels
    Export reports as CSV
    View and manage all users

🚚 Delivery Agent
    See assigned parcels
    Update delivery status
    View route on embedded Google Maps

👨‍💼 Customer
    Register and login
    Track deliveries with real-time status updates
    View historical bookings and status history

🔐 Authentication & Roles
    JWT-based secure login for all users
    Middleware-controlled role-based access

🗺️ Geolocation & Tracking
    Google Maps geocoding API used to resolve pickup/delivery addresses to coordinates
    Admin: parcel overview
    Agent: delivery plan
    Customer: order history

📤 Report Generation
    CSV: parcel data including ID, customer, agent, payment
    Downloadable from Admin Dashboard

🔑 Environment Variables

    client/.env
    REACT_APP_Maps_API_KEY=your_google_maps_api_key

    server/.env
    NODE_ENV=development
    PORT=5001
    MONGO_URI=your_mongo_connection_string
    JWT_SECRET=your_secret_key
    Maps_API_KEY=your_google_maps_api_key

📦 Installation Guide
    1. Clone the repository
    git clone https://github.com/yourusername/courier-parcel-management.git
    cd courier-parcel-management

    2. Install dependencies Frontend
    cd client
    npm install
    Backend
    cd ../server
    npm install

    3. Start the app
    Frontend
    npm start
    Backend
    npm start

📝 Authors & Acknowledgements
    Developed as part of a MERN stack assignment project by smabdulmueid97. Contributions welcome!