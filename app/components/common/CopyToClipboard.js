import React from 'react';
import Clipboard from '@ux/icon/clipboard';
import { Tooltip } from 'evergreen-ui';
import '@ux/icon/clipboard/index.css';

export default class extends React.Component {
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
