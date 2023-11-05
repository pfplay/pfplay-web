import Footer from '@/components/layouts/Footer';

const AuthLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      {children}
      <Footer />
    </>
  );
};

export default AuthLayout;
