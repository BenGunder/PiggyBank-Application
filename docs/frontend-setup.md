# Frontend Setup and Testing Guide

## Prerequisites

Before running the frontend, you need to install Node.js which includes npm (Node Package Manager).

### Installing Node.js

1. Download Node.js from https://nodejs.org/ (LTS version recommended)
2. Run the installer and follow the installation wizard
3. Verify installation by opening a terminal and running:
   ```bash
   node --version
   npm --version
   ```

## Frontend Setup Instructions

### Step 1: Navigate to Frontend Directory
```bash
cd C:\Users\Ben\CascadeProjects\finance-tracker\frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all the packages defined in `package.json`:
- React and React DOM
- React Router for navigation
- Axios for API communication
- Recharts for data visualization
- Lucide React for icons
- Tailwind CSS for styling
- Vite for build tooling

### Step 3: Start the Development Server
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Running the Complete Application

To run both backend and frontend simultaneously, you'll need two terminal windows:

### Terminal 1 - Backend
```bash
cd C:\Users\Ben\CascadeProjects\finance-tracker\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend will run on `http://localhost:8000`

### Terminal 2 - Frontend
```bash
cd C:\Users\Ben\CascadeProjects\finance-tracker\frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

## User Interface Overview

### Authentication Pages

#### Login Page (`/login`)
- Clean, centered card layout
- Email and password fields
- Error message display
- Link to registration page
- Gradient background for visual appeal

#### Register Page (`/register`)
- Similar layout to login
- Username, email, password, and confirm password fields
- Client-side validation (password matching, minimum length)
- Error message display
- Link to login page

### Main Application Layout

#### Navigation Bar
- Top navigation with app branding
- Links to Dashboard, Budgets, and Expenses
- Current user display
- Logout button
- Active route highlighting

#### Dashboard (`/dashboard`)
- **Overview Cards**: Four key metrics displayed with icons
  - Total Expenses (currency formatted)
  - Total Transactions (count)
  - Active Budgets (count)
  - Categories (count)
- **Expense by Category Chart**: Interactive pie chart using Recharts
- **Category Breakdown**: Progress bars showing spending distribution
- **Recent Budgets**: List of recent budgets with quick access

#### Budgets Page (`/budgets`)
- **Header**: Page title and "Add Budget" button
- **Budget Cards**: Grid layout showing
  - Budget name and period
  - Amount with large, prominent display
  - Category (if set)
  - Creation date
  - Edit and delete buttons
- **Empty State**: Friendly message when no budgets exist
- **Add/Edit Modal**: Form with
  - Budget name
  - Amount input
  - Period dropdown (monthly/weekly/yearly)
  - Optional category
  - Cancel and submit buttons

#### Expenses Page (`/expenses`)
- **Header**: Page title and "Add Expense" button
- **Filter Section**: 
  - Category dropdown filter
  - Budget dropdown filter
  - Clear filters button
- **Expenses Table**: 
  - Date with calendar icon
  - Description
  - Category badge
  - Associated budget
  - Amount (currency formatted)
  - Edit and delete actions
- **Empty State**: Friendly message when no expenses exist
- **Add/Edit Modal**: Form with
  - Amount input
  - Category input
  - Optional description
  - Budget association dropdown
  - Date picker
  - Cancel and submit buttons

## Visual Design Features

### Color Scheme
- **Primary Color**: Sky blue (`#0ea5e9`) for main actions and highlights
- **Secondary Colors**: Green, purple, orange for data visualization
- **Background**: Light gray (`#f9fafb`) for reduced eye strain
- **Cards**: White with subtle shadows for depth

### Typography
- Clean, readable fonts
- Clear hierarchy with different font weights
- Appropriate spacing for readability

### Interactive Elements
- Hover effects on buttons and links
- Smooth transitions
- Loading states for async operations
- Error messages with clear visual feedback
- Confirmation dialogs for destructive actions

### Responsive Design
- Mobile-friendly layouts
- Grid systems that adapt to screen size
- Touch-friendly button sizes

## Testing the Application

### 1. Test Authentication Flow
1. Navigate to `http://localhost:3000`
2. You should be redirected to `/login`
3. Click "Sign up" to go to registration
4. Create a new account with valid credentials
5. After registration, you'll be redirected to login
6. Log in with your credentials
7. You should be redirected to the dashboard

### 2. Test Dashboard
1. After logging in, view the dashboard
2. Initially, you'll see empty states (no data yet)
3. The four metric cards should show zeros
4. The chart and breakdown sections should show "No data available"

### 3. Test Budget Management
1. Click "Budgets" in the navigation
2. Click "Add Budget" button
3. Fill in the form:
   - Name: "Monthly Groceries"
   - Amount: "500"
   - Period: "monthly"
   - Category: "Food"
4. Click "Create"
5. The budget card should appear in the grid
6. Test editing: Click the edit icon, change amount, save
7. Test deleting: Click the delete icon, confirm deletion

### 4. Test Expense Tracking
1. Click "Expenses" in the navigation
2. Click "Add Expense" button
3. Fill in the form:
   - Amount: "25.50"
   - Category: "Food"
   - Description: "Lunch"
   - Budget: Select the budget you created
   - Date: Today's date
4. Click "Add"
5. The expense should appear in the table
6. Add a few more expenses with different categories
7. Test the filters by category and budget
8. Test editing and deleting expenses

### 5. Test Analytics
1. Navigate back to the Dashboard
2. The metric cards should now show actual data
3. The pie chart should display expense distribution by category
4. The category breakdown should show progress bars
5. Recent budgets should appear in the list

### 6. Test Logout
1. Click the "Logout" button in the navigation
2. You should be redirected to the login page
3. Try to access protected routes directly (e.g., `/dashboard`)
4. You should be redirected back to login

## Verifying Visual Appeal

### Check These Visual Elements:
1. **Color Consistency**: Primary color used consistently for actions
2. **Spacing**: Adequate whitespace between elements
3. **Typography**: Text is readable and well-hierarchized
4. **Shadows**: Cards have subtle shadows for depth
5. **Icons**: Lucide icons appear correctly and are sized appropriately
6. **Charts**: Recharts pie chart renders with proper colors
7. **Responsive**: Try resizing the browser window - layout should adapt
8. **Loading States**: Loading indicators appear during async operations
9. **Error Messages**: Error states are clearly visible with red styling
10. **Hover Effects**: Buttons and links have hover states

### Browser Developer Tools
Use browser DevTools (F12) to:
- Check for console errors
- Inspect element styling
- Test responsive behavior with device emulation
- Monitor network requests to backend API

## Troubleshooting

### Frontend Won't Start
- Ensure Node.js is installed (`node --version`)
- Delete `node_modules` folder and run `npm install` again
- Check if port 3000 is already in use

### API Errors
- Ensure backend is running on `http://localhost:8000`
- Check browser console for network errors
- Verify CORS configuration in backend
- Check that JWT token is being sent in request headers

### Styling Issues
- Tailwind CSS warnings are normal until dependencies are installed
- After `npm install`, styling should work correctly
- If issues persist, clear browser cache

### Charts Not Displaying
- Ensure Recharts is installed
- Check that data is being fetched correctly
- Verify data format matches expected structure

## Next Steps After Testing

Once you've verified the application is working and visually appealing:

1. **Customize Styling**: Modify `tailwind.config.js` to change colors
2. **Add More Features**: 
   - Budget vs actual spending comparison
   - Expense trends over time
   - Export data to CSV
   - Recurring expenses
3. **Improve UX**:
   - Add loading skeletons
   - Implement optimistic updates
   - Add toast notifications
4. **Deployment**: Prepare for production deployment

## File Structure Reference

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # Main app layout with navigation
│   │   └── ExpenseChart.jsx    # Recharts pie chart component
│   ├── context/
│   │   └── AuthContext.jsx     # Authentication state management
│   ├── pages/
│   │   ├── Login.jsx           # Login page
│   │   ├── Register.jsx        # Registration page
│   │   ├── Dashboard.jsx       # Main dashboard with analytics
│   │   ├── Budgets.jsx         # Budget management page
│   │   └── Expenses.jsx        # Expense tracking page
│   ├── services/
│   │   └── api.js              # Axios API client with interceptors
│   ├── utils/
│   │   └── cn.js               # Utility for className merging
│   ├── App.jsx                 # Main app with routing
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles with Tailwind
├── index.html                  # HTML template
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── postcss.config.js           # PostCSS configuration
```

## Summary

The frontend is now complete with:
- ✅ React + Vite setup
- ✅ React Router for navigation
- ✅ Authentication flow (login/register/logout)
- ✅ Protected routes with JWT authentication
- ✅ Dashboard with analytics and charts
- ✅ Budget management (CRUD operations)
- ✅ Expense tracking with filtering
- ✅ Modern UI with Tailwind CSS
- ✅ Responsive design
- ✅ Error handling and loading states
- ✅ API integration with backend

To see the application in action, install Node.js, run the setup commands, and navigate to `http://localhost:3000`!
