# RMV Stainless Steel Fabrication - Frontend

A modern, responsive web application for RMV Stainless Steel Fabrication company. Built with React, TypeScript, Vite, and Tailwind CSS.

## 🚀 Features

### Landing Pages
- **Home Page** - Hero section, services overview, recent projects, testimonials, and call-to-action
- **About Page** - Company history, mission, values, and team information
- **Services Page** - Detailed service offerings with descriptions
- **Portfolio Page** - Showcase of completed projects with filtering

### Authentication System
- User registration with email verification
- Login with JWT authentication
- Password reset functionality
- Protected routes based on user roles

### Role-Based Dashboards

#### Customer Dashboard
- View appointments, projects, and payments overview
- Book new appointments
- Track project progress
- View payment history
- Dark themed collapsible sidebar

#### Admin Dashboard
- Full system management
- User management (CRUD operations)
- Appointments management
- Projects oversight
- Payments tracking
- Activity logs
- Reports generation
- Same dark themed collapsible sidebar as customer

#### Appointment Agent Dashboard
- Manage customer appointments
- Calendar view
- Assign appointments to sales staff
- Same dark themed collapsible sidebar

#### Other Role Dashboards
- **Sales Staff** - Handle appointments and create projects
- **Engineer** - Manage blueprints and project specifications
- **Cashier** - Process and verify payments
- **Fabrication Staff** - Track active fabrication projects

### UI/UX Features
- Fully responsive design (mobile, tablet, desktop)
- Dark themed collapsible sidebar with tooltips
- Mobile bottom navigation bar
- Loading states with spinners
- Empty states with icons
- Consistent design system across all pages
- Tailwind CSS styling with slate color palette

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API calls
- **Context API** - State management for authentication

## 📁 Project Structure

```
frontend/
├── public/
│   └── 1.jpg                    # Logo image
├── src/
│   ├── api/
│   │   ├── auth.ts              # Authentication API calls
│   │   ├── client.ts            # Axios instance configuration
│   │   └── services.ts          # Other API services
│   ├── components/
│   │   ├── layout/
│   │   │   ├── CustomerLayout.tsx    # Customer dashboard layout
│   │   │   ├── DashboardLayout.tsx   # Other roles dashboard layout
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── LandingLayout.tsx
│   │   │   └── index.ts
│   │   ├── ui/
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   └── index.ts
│   │   └── ProtectedRoute.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication context
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── ResetPassword.tsx
│   │   │   └── VerifyEmail.tsx
│   │   ├── dashboard/
│   │   │   ├── admin/
│   │   │   │   ├── ActivityLogs.tsx
│   │   │   │   ├── AdminAppointments.tsx
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── AdminPayments.tsx
│   │   │   │   ├── AdminProjects.tsx
│   │   │   │   ├── AdminReports.tsx
│   │   │   │   └── UserManagement.tsx
│   │   │   ├── agent/
│   │   │   │   ├── AgentDashboard.tsx
│   │   │   │   └── AppointmentList.tsx
│   │   │   ├── cashier/
│   │   │   ├── customer/
│   │   │   │   ├── BookAppointment.tsx
│   │   │   │   ├── CustomerDashboard.tsx
│   │   │   │   ├── MyAppointments.tsx
│   │   │   │   ├── MyPayments.tsx
│   │   │   │   └── MyProjects.tsx
│   │   │   ├── engineer/
│   │   │   ├── fabrication/
│   │   │   ├── sales/
│   │   │   └── shared/
│   │   └── landing/
│   │       ├── About.tsx
│   │       ├── Home.tsx
│   │       ├── Portfolio.tsx
│   │       └── Services.tsx
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── App.tsx                  # Main app component with routes
│   ├── index.css                # Global styles
│   └── main.tsx                 # Entry point
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/RMV-Stainless-Steel-Fabrication.git
   cd RMV-Stainless-Steel-Fabrication
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```



3. **Environment Setup**

   1. Copy `.env.example` to `.env` in the root directory:
      ```bash
      cp .env.example .env
      # On Windows (PowerShell):
      Copy-Item .env.example .env
      ```

   2. Edit `.env` and set the required variables:
      - `VITE_API_URL` (required): The base URL for your backend API (e.g. `http://localhost:5000` for local dev)
      - (Optional) Add any other `VITE_` variables as needed for features or analytics

   **Important:**
   - The frontend `.env.example` does **not** include any MongoDB or backend variables. Only variables prefixed with `VITE_` are used by the frontend.
   - MongoDB is **not required** to run the frontend. You only need the backend API running and accessible at the URL you set in `VITE_API_URL`.

   **Example:**
   ```env
   VITE_API_URL=http://localhost:5000
   ```

---

## 🐛 Troubleshooting

**Common Issues:**

1. **Login or API calls fail**
   - Make sure the backend is running and accessible at the URL in your `.env` (`VITE_API_URL`).
   - If you see CORS errors, check that the backend allows requests from the frontend's origin.

2. **Styling not applying**
   - Run `npm run dev` to rebuild
   - Clear browser cache

3. **TypeScript errors**
   - Run `npm run build` to see all errors
   - Check type definitions in `src/types/index.ts`

---

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 🔧 Configuration

### Tailwind CSS
Configuration is in `tailwind.config.js`. The project uses a custom slate color palette.

### Vite
Configuration is in `vite.config.ts`. Proxy is set up for API calls to backend.

### TypeScript
Configuration is in `tsconfig.json` with strict mode enabled.

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (md)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px (lg)

## 🎨 Design System

### Colors
- Primary: Slate palette (slate-50 to slate-900)
- Accent: Blue, Green, Amber, Red for status indicators
- Dark sidebar: slate-900 background

### Components
- Consistent card styling with `rounded-xl md:rounded-2xl`
- SVG icons throughout (no emojis)
- Loading spinners: `border-4 border-slate-200 border-t-slate-900`

## 🔐 User Roles

| Role | Access |
|------|--------|
| `customer` | Book appointments, view projects/payments |
| `appointment_agent` | Manage all appointments |
| `sales_staff` | Handle customer consultations, create projects |
| `engineer` | Manage blueprints and specifications |
| `cashier` | Process payments |
| `fabrication_staff` | Track fabrication progress |
| `admin` | Full system access |

## 📝 Development Notes

### Adding New Pages
1. Create component in appropriate folder under `src/pages/`
2. Add route in `App.tsx`
3. Update navigation in layout component if needed

### Adding New API Endpoints
1. Add function in `src/api/services.ts`
2. Use the configured axios client from `src/api/client.ts`

## 🐛 Troubleshooting

### Common Issues

1. **API connection errors**
   - Ensure backend is running on port 5000
   - Check `.env` file has correct API URL

2. **Styling not applying**
   - Run `npm run dev` to rebuild
   - Clear browser cache

3. **TypeScript errors**
   - Run `npm run build` to see all errors
   - Check type definitions in `src/types/index.ts`

## 📄 License

This project is proprietary software for RMV Stainless Steel Fabrication.

## 👥 Contributors

- Development Team

---

**Backend Repository**: [RMV-Stainless-Steel-Fabrication-Backend](https://github.com/YOUR_USERNAME/RMV-Stainless-Steel-Fabrication-Backend)
