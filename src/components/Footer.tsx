const Footer = () => {
  return (
    <footer className="mt-5 border-t border-slate-800 pt-3 text-center">
      <p className="text-[10px] text-slate-500">Auto Refresh · Manifest V3</p>
      <p className="mt-1 text-[10px] text-slate-500">
        Created by{" "}
        <a
          href="https://faisalhakim.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-slate-300 transition-colors hover:text-indigo-400"
        >
          Awosky
        </a>
      </p>
    </footer>
  );
};

export default Footer;
