import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import LessonPage from './pages/adminPages/lesson.jsx';
import './styles/global.css'
import ToDoApp from './components/admin/todo/todoApp.jsx';
import ErrorPage from './pages/error.jsx';
import UserPage from './pages/adminPages/user.jsx';
import RegisterPage from './pages/register.jsx';
import LoginPage from './pages/login.jsx';
import { AuthWrapper } from './components/context/auth.context.jsx';
import PrivateAdminRoute from './pages/privateRoute/private.admin.route.jsx';
import PrivateUserRoute from './pages/privateRoute/private.user.route.jsx';
import CoursePage from './pages/adminPages/course.jsx';
import ChapterPage from './pages/adminPages/chapter.jsx';
import HomePage from './components/user/HomePage.jsx';
import App from './App.jsx';
import MainPage from './pages/userPages/home.jsx';
import MyCoursePage from './pages/userPages/mycourse.jsx';
import CourseDetail from './pages/userPages/course.detail.jsx';
import LearningPage from './pages/userPages/learning.page.jsx';
import ProfilePage from './pages/userPages/editProfile.page.jsx';
import TestPage from './pages/userPages/test.page.jsx';
import SuccessfulPayment from './pages/userPages/payment/payment.success.jsx';
import OrderPage from './pages/adminPages/order.jsx';
import RevenueChart from './components/admin/revenue/revenue.order.jsx';
import ExamPage from './pages/adminPages/test.jsx';
import ReviewPage from './pages/adminPages/review.jsx';
import TokenPackagePage from './pages/adminPages/tokenPackage.jsx';
import SuccessfulRecharge from './pages/userPages/payment/recharge.success.jsx';
const router = createBrowserRouter([
  {
    path: "/admin",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: (
          <PrivateAdminRoute>
            <ToDoApp />
          </PrivateAdminRoute>)
      },
      {
        path: "/admin/lessons",
        element: (
          <PrivateAdminRoute>
            <LessonPage />
          </PrivateAdminRoute>)
      },
      {
        path: "/admin/exams",
        element: (
          <PrivateAdminRoute>
            <ExamPage />
          </PrivateAdminRoute>)
      },
      {
        path: "/admin/courses",
        element: (
          <PrivateAdminRoute>
            <CoursePage />
          </PrivateAdminRoute>)
      },
      {
        path: "/admin/chapters",
        element: (
          <PrivateAdminRoute>
            <ChapterPage />
          </PrivateAdminRoute>)
      },
      {
        path: "/admin/users",
        element: (
          <PrivateAdminRoute>
            <UserPage />
          </PrivateAdminRoute>),
      },
      {
        path: "/admin/orders",
        element: (
          <PrivateAdminRoute>
            <OrderPage />
          </PrivateAdminRoute>)
      },
      {
        path: "/admin/reviews",
        element: (
          <PrivateAdminRoute>
            <ReviewPage />
          </PrivateAdminRoute>)
      },
      {
        path: "/admin/token_packages",
        element: (
          <PrivateAdminRoute>
            <TokenPackagePage />
          </PrivateAdminRoute>)
      },
      {
        path: "/admin/revenue-chart",
        element: (
          <PrivateAdminRoute>
            <RevenueChart />
          </PrivateAdminRoute>)
      },
    ],
  },
  {
    path: "/",
    element: <HomePage />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <MainPage />
      },
      {
        path: "/course/detail/:courseId",
        element: <CourseDetail />,
      },
      {
        path: "/mycourse",
        element: (<PrivateUserRoute>
          <MyCoursePage />
        </PrivateUserRoute>),
      },
      {
        path: "/course/:courseId/learning",
        element: (<PrivateUserRoute>
          <LearningPage />
        </PrivateUserRoute>)
      },
      {
        path: "/editProfile",
        element: (<PrivateUserRoute>
          <ProfilePage />
        </PrivateUserRoute>)
      }
    ]
  },


  {
    path: "/success/payment",
    element:
      <SuccessfulPayment />
  },
  {
    path: "/success/recharge",
    element:
      <SuccessfulRecharge />
  },
  {
    path: "/test/lesson/:lessonId",
    element:
      <TestPage />
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  }
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthWrapper>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </AuthWrapper>
)
