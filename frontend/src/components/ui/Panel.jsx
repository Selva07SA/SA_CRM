function Panel({ title, children, footer = null }) {
  return (
    <section className="crm-panel">
      {title ? <h3>{title}</h3> : null}
      {children}
      {footer ? <div className="crm-panel-footer">{footer}</div> : null}
    </section>
  );
}

export default Panel;
