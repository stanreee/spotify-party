// modified code from Dimitry Dushkin's react-sliding-pane
// can be found here: https://github.com/DimitryDushkin/sliding-pane

import React from "react";
import Modal from "react-modal";

const CLOSE_TIMEOUT = 500;

export function QueuePane({
  isOpen,
  title,
  subtitle,
  onRequestClose,
  onAfterOpen,
  onAfterClose,
  children,
  className,
  overlayClassName,
  closeIcon,
  from = "right",
  width,
  shouldCloseOnEsc,
  hideHeader = false,
}) {
  const directionClass = `slide-pane_from_${from}`;

  // Reduce bundle size by removing polyfill if array destruction
  const state = React.useState(false);
  const wasOpen = state[0];
  const setWasOpen = state[1];

  const handleAfterOpen = React.useCallback(() => {
    setTimeout(() => {
      setWasOpen(true);
      onAfterOpen?.();
    }, 0);
  }, [onAfterOpen]);

  const handleAfterClose = React.useCallback(() => {
    setTimeout(() => {
      setWasOpen(false);
      onAfterClose?.();
    }, 0);
  }, [onAfterClose]);

  return (
    <Modal
      ariaHideApp={false}
      overlayClassName={{
        base: `slide-pane__overlay ${overlayClassName || ""}`,
        afterOpen: wasOpen ? "overlay-after-open" : '',
        beforeClose: "overlay-before-close"
      }}
      className={{
        base: `slide-pane ${directionClass} ${className || ""}`,
        afterOpen: wasOpen ? "content-after-open" : '',
        beforeClose: "content-before-close"
      }}
      style={{
        content: { width: width || "80%" },
      }}
      closeTimeoutMS={CLOSE_TIMEOUT}
      isOpen={isOpen}
      shouldCloseOnEsc={shouldCloseOnEsc}
      onAfterOpen={handleAfterOpen}
      onAfterClose={handleAfterClose}
      onRequestClose={onRequestClose}
      contentLabel={`Modal "${title || ""}"`}
    >
      {!hideHeader && (
        <div className="slide-pane__header">
          <div className="slide-pane__close" onClick={onRequestClose}>
            {closeIcon || <IconClose />}
          </div>
          <div className="slide-pane__title-wrapper">
            <h2 className="slide-pane__title">{title}</h2>
            <div className="slide-pane__subtitle">{subtitle}</div>
          </div>
        </div>
      )}
      <div className="slide-pane__content">{children}</div>
    </Modal>
  );
}

function IconClose() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="25" viewBox="0 0 50 50" overflow="visible" stroke="white" stroke-width="10" stroke-linecap="round">
        <line x2="50" y2="50" />
        <line x1="50" y2="50" />
    </svg>
  );
}

export default QueuePane;