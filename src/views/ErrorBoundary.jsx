// src/views/ErrorBoundary.jsx
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-8 text-red-600">
          <h1 className="text-2xl font-bold mb-4">⚠️ Something went wrong.</h1>
          <p>Please try refreshing the page or check back later.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
