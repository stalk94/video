import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import globalState from "../global.state";


const PrivateRoute =()=> {
    globalState.user.
  
    // Если пользователь не авторизован или у него нет нужных прав
    if(!user.isAuthenticated) {
        return <Navigate to="/login" />; // Перенаправляем на страницу входа
    }
  
    // Если у пользователя есть роль, проверяем её
    if(user.role !== requiredRole) {
      return <Navigate to="/" />; // Если роль не соответствует, перенаправляем на главную
    }
  
    // Если всё ок — отображаем вложенные компоненты (путь, который оборачивает PrivateRoute)
    return <Outlet />;
}