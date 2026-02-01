import React from 'react';

const TitleCardPanel = ({ setActivePanel, setTutorialOpen, setTutorialStepIndex }) => (
    <div className="panel panel-title-card" onClick={() => setActivePanel('text')}>
        <div className="page-title">
            <span className="logo-text" aria-label="STITCH-UATION">STITCH-UATION</span>
            <span className="logo-tag">cross stitch pattern generator</span>
        </div>
        <button
            type="button"
            className="title-help"
            aria-label="Open how-to walkthrough"
            onClick={(event) => {
                event.stopPropagation();
                setTutorialOpen(true);
                setTutorialStepIndex(0);
            }}
        >
            ?
        </button>
    </div>
);

export default TitleCardPanel;
