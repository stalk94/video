import React from "react";
import { EVENT, send } from "../lib/engine";


class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error: Error, errorInfo: any) {
        //console.error("Ошибка в react:", error, errorInfo.componentStack);
        const data = {
            type: 'react',
            name: error.name,
            message: error.message,
            stack: errorInfo.componentStack
        }
        
        send('error', { time: new Date().toUTCString(), ...data }, 'POST');
    }

    render() {
        if(this.state.hasError) {
            return(
                <h2>
                    Упс. Что-то пошло не так...
                </h2>
            );
        }
        return this.props.children;
    }
}


export default ErrorBoundary;