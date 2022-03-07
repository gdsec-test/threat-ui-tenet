import { Alert, Button } from '@ux/uxcore2';
import React from 'react';

export default function RenderError (WrappedComponent, customMessage = '') {
  return class extends React.Component {
    constructor (props) {
      super(props);
      this.state = { hasRenderingError: false };
    }

    static getDerivedStateFromError (error) {
      return { hasRenderingError: error };
    }

    componentDidCatch (error, errorInfo) {}

    render () {
      const { hasRenderingError } = this.state;
      if (this.state.hasRenderingError) {
        const { message = '' } = hasRenderingError;
        return <Alert
            emphasis='critical'
            dismissible={ false }>
          <div>
            <b>{customMessage}</b><br />
            Error during rendering. Please, refresh page
            <br />
            {message}
            <br />
            <Button design='primary' onClick={() => {
              window.location.reload();
            }}>Reload</Button>
          </div>
        </Alert>;
      }
      return <WrappedComponent {...this.props} />;
    }
  };
}
