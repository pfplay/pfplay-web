import Router from 'next/router';
import React from 'react';

import { isInstanceOfAPIError } from '@/utils/error';

import NotEnabled from './NotEnabled';
import NotFound from './NotFound';

type ErrorBoundaryProps = React.PropsWithChildren<Record<string, any>>;

interface IErrorBoundaryState {
  error: Error | null;
}

const errorBoundaryState: IErrorBoundaryState = {
  error: null,
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, IErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = errorBoundaryState;
  }

  static getDerivedStateFromError(error: Error) {
    console.error(error);
    return { error };
  }

  private resetState = () => {
    this.setState(errorBoundaryState);
  };

  private setError = (error: Error) => {
    console.error(error);

    this.setState({ error });
  };

  private handleError = (event: ErrorEvent) => {
    this.setError(event.error);
    event.preventDefault?.();
  };

  private handleRejectedPromise = (event: PromiseRejectionEvent) => {
    event?.promise?.catch?.(this.setError);
    event.preventDefault?.();
  };

  public componentDidMount() {
    window.addEventListener('error', this.handleError);
    window.addEventListener('unhandledrejection', this.handleRejectedPromise);

    Router.events.on('routeChangeStart', this.resetState);
  }

  public componentWillUnmount() {
    window.removeEventListener('error', this.handleError);
    window.removeEventListener('unhandledrejection', this.handleRejectedPromise);

    Router.events.off('routeChangeStart', this.resetState);
  }

  public render() {
    const { error } = this.state;

    if (isInstanceOfAPIError(error)) {
      const { redirectUrl, notFound } = error;

      if (notFound) {
        return <NotFound />;
      }

      if (redirectUrl) {
        window.location.href = redirectUrl;
      }

      return <NotEnabled />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
