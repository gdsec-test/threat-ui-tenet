import Clipboard from '@ux/icon/clipboard';
import '@ux/icon/clipboard/index.css';
import { Tooltip } from 'evergreen-ui';
import React from 'react';
import RenderError from './RenderError';

 class CopyToClipboard extends React.Component {
  constructor() {
    super(...arguments);
    this.state = { isShowCopyTooltip: false };
    this.copyToClipboard = this.copyToClipboard.bind(this);
  }

  async copyToClipboard(e) {
    e.stopPropagation();
    const { value } = this.props;
    try {
      await navigator.clipboard.writeText(value);
      this.setState({ isShowCopyTooltip: <span style={{ color: 'green' }}>Copied to Clipboard</span> });
    } catch (err) {
      this.setState({ isShowCopyTooltip: <span style={{ color: 'red' }}>Failed to copy to clipboard!</span> });
    }
    setTimeout(() => this.setState({ isShowCopyTooltip: false }), 1000);
  }

  render() {
    const { isShowCopyTooltip } = this.state;
    return (
      <Tooltip appearance='card' content={isShowCopyTooltip} isShown={!!isShowCopyTooltip}>
        <span className='CopyToClipboard'>
          <span onClick={this.copyToClipboard}>
            <Clipboard />
          </span>
        </span>
      </Tooltip>
    );
  }
}

export default RenderError(CopyToClipboard);