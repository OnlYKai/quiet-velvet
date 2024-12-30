const GoogleSearch = ({ commandRunner, browserPath }) => {
    
    const onSubmit = (e) => {
        e.preventDefault();
        const research = e.target[0].value;
        e.target[0].value = '';
        commandRunner(`shell-exec ${browserPath} https://www.google.com/search?q=${research.replaceAll(' ', '+')}`);
    }
    
    return (
        <form className="box google lh-small" onSubmit={(e) => onSubmit(e)}>
            <i className="nf nf-fa-google icon-small"></i>
            <input type="text" placeholder="Search on Google" spellCheck="false"/>
        </form>
    );
};

export default GoogleSearch;