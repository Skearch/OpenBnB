# Openbnb
Openbnb is an open-source platform for businesses. It provides a complete solution for managing property listings, bookings, and user accounts. Whether you're a small business or an individual, Openbnb is designed to help you streamline your operations.

## Features
- User authentication with role-based access (Guest, Staff, Owner).
- Property listing and management.
- Booking system with availability tracking.
- Messaging system for communication between users.
- Admin dashboard for managing properties and accounts.
- Email notifications for booking confirmations.
- Fully customizable frontend using EJS templates and TailwindCSS.

## Installation
1. Clone the repository:
```bash
git clone https://github.com/Skearch/Openbnb.git
cd openbnb
```

2. Install dependencies:
```bash
npm install
```

3. Configure the environment variables: Create a `.env` file in the root directory with the following format:
```bash
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
JWT_REFRESH_SECRET=your_jwt_secret_refresh
JWT_SECRET=your_jwt_secret
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password
```

4. Configure the application settings: Edit the `config.json` file in the root directory with the following format:
```json
{
  "Business": {
    "Name": "Openbnb",
    "Email": "openbnb@example.com",
    "PhoneNumber": "+123 456 7890",
    "SocialMedia": {
      "Facebook": "https://www.facebook.com/yourbusiness",
      "Instagram": "https://www.instagram.com/yourbusiness",
      "Twitter": "https://www.twitter.com/yourbusiness"
    }
  },
  "Website": {
    "HeadTitle": "Openbnb - Book Your Perfect Stay",
    "FooterDescription": "The platform to book your perfect stay.",
    "Hero": {
      "Title": "Book your perfect stay in minutes",
      "Description": "The perfect getaway for everyone!",
      "Button": "Find Your Stay!"
    },
    "Recommend": {
      "Title": "Our Top Picks",
      "Button": "Explore Listings"
    },
    "Reviews": {
      "Title": "What People Say About Us",
      "List": [
        {
          "Name": "John Doe",
          "Review": "Openbnb made booking so easy! Highly recommend."
        },
        {
          "Name": "Jane Smith",
          "Review": "Great platform with amazing options!"
        }
      ]
    },
    "Subscribe": {
      "Title": "Subscribe for updates and promotions!",
      "Button": "Join Now"
    }
  }
}
```

5. Run database migrations:
```bash
npx prisma migrate dev --schema=src/models/schema.prisma
```

6. Start the server:
```bash
npm run dev
```

## Usage
Use the admin dashboard to manage properties and user accounts. Guests can browse listings, book properties, and send messages.
