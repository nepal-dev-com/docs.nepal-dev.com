import './home.css';

export default function Layout({ children }: LayoutProps<'/'>) {
  return <div className="home">{children}</div>;
}
