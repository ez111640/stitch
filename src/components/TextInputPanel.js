import React from 'react';

const TextInputPanel = ({ activePanel, previewImage, setActivePanel, handleTextImageClick, clearTextBox, quillRef }) => (
    <div
        className={`panel panel-compact ${activePanel === 'text' ? 'panel-active' : ''} ${previewImage ? 'panel-muted panel-locked' : ''}`}
        onClick={() => {
            if (previewImage) return;
            setActivePanel('text');
        }}
    >
        <div className="panel-header">
            <div className="panel-title-row">
                <h2 className="panel-title">1) Type your text</h2>
                <span className="panel-help">
                    ?
                    <span className={`panel-tooltip ${previewImage ? '' : 'panel-tooltip-inactive'}`}>
                        {previewImage && (
                            <>
                                <span className="panel-tooltip-warning">Finish editing Box 2</span>
                                <span className="panel-tooltip-warning">Clear or Add to Hoop</span>
                            </>
                        )}
                        <span className="panel-tooltip-line">Type your text</span>
                        <span className="panel-tooltip-line">Click Customize Font</span>
                    </span>
                </span>
            </div>
        </div>
        <div ref={quillRef} className="editor-surface" style={{ height: '240px' }}></div>
        <div className="action-row">
            <button type="button" onClick={handleTextImageClick} className="btn btn-primary" disabled={Boolean(previewImage)}>
                Customize Font
            </button>
            <button type="button" onClick={clearTextBox} className="btn" disabled={Boolean(previewImage)}>
                Clear Text
            </button>
        </div>
    </div>
);

export default TextInputPanel;
