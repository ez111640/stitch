import React from 'react';

const ComponentsPanel = ({
    activePanel,
    setActivePanel,
    componentsView,
    setComponentsView,
    components,
    premadeComponents,
    componentsPage,
    setComponentsPage,
    premadePage,
    setPremadePage,
    pageSize,
    restoreComponentToBox1,
    restoreComponentToBox2,
    restoreComponentToBox3,
    deleteComponent,
    addComponentToHoop
}) => {
    const isCustom = componentsView === 'custom';
    const items = isCustom ? components : premadeComponents;
    const currentPage = isCustom ? componentsPage : premadePage;
    const setPage = isCustom ? setComponentsPage : setPremadePage;
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const pageItems = items.slice(startIndex, startIndex + pageSize);

    return (
        <div
            className={`components-panel ${activePanel === 'components' ? 'panel-active' : ''}`}
            onClick={() => setActivePanel('components')}
        >
            <div className="components-layout">
                <div className="components-sidebar">
                    <div className="components-header">
                        <div className="panel-title-row">
                            <h3>Components</h3>
                            <span
                                className="panel-help"
                                data-tooltip={"• Click Add to Hoop\n• Reuse saved components"}
                            >
                                ?
                            </span>
                        </div>
                    </div>
                    <div className="components-toggle">
                        <button
                            type="button"
                            className={`btn components-toggle-button ${componentsView === 'custom' ? 'is-active' : ''}`}
                            onClick={() => setComponentsView('custom')}
                        >
                            Custom
                        </button>
                        <button
                            type="button"
                            className={`btn components-toggle-button ${componentsView === 'premade' ? 'is-active' : ''}`}
                            onClick={() => setComponentsView('premade')}
                        >
                            Premade
                        </button>
                    </div>
                    <div className="components-nav">
                        <button
                            type="button"
                            className="btn"
                            disabled={safePage <= 1}
                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            aria-label="Previous page"
                        >
                            ←
                        </button>
                        <div className="components-page-indicator" aria-live="polite">
                            {safePage}
                        </div>
                        <button
                            type="button"
                            className="btn"
                            disabled={safePage >= totalPages}
                            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                            aria-label="Next page"
                        >
                            →
                        </button>
                    </div>
                </div>
                <div className="components-content">
                    {isCustom ? (
                        pageItems.length === 0 ? (
                            <div className="components-empty">Converted items will appear here.</div>
                        ) : (
                            <div className="components-grid">
                                {pageItems.map((component) => (
                                    <div key={component.id} className="component-card">
                                        <div className="component-actions">
                                            <button
                                                type="button"
                                                className="component-chip"
                                                onClick={() => restoreComponentToBox1(component)}
                                                aria-label="Restore to box 1"
                                            >
                                                1
                                            </button>
                                            <button
                                                type="button"
                                                className="component-chip"
                                                onClick={() => restoreComponentToBox2(component)}
                                                aria-label="Restore to box 2"
                                            >
                                                2
                                            </button>
                                            <button
                                                type="button"
                                                className="component-chip"
                                                onClick={() => restoreComponentToBox3(component)}
                                                aria-label="Restore to box 3"
                                            >
                                                3
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            className="component-delete"
                                            onClick={() => deleteComponent(component.id)}
                                            aria-label="Delete component"
                                        >
                                            ×
                                        </button>
                                        <div className="component-thumb">
                                            <img src={component.src} alt="Component" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        <div className="components-grid">
                            {pageItems.map((component) => (
                                <div key={component.id} className="component-card premade-card">
                                    <div className="component-thumb">
                                        <img src={component.src} alt={component.name} />
                                    </div>
                                    <div className="component-name">{component.name}</div>
                                    <button
                                        type="button"
                                        className="btn component-add"
                                        onClick={() => addComponentToHoop(component)}
                                    >
                                        Add to Hoop
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComponentsPanel;
