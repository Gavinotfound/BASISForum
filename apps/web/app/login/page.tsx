import { BasisProvider, LoginForm } from '@basis-forum/ui';
import ClientLayout from '../components/ClientLayout';
import { loginUser } from '../actions/login';

export default function LoginPage() {
  return (
    <BasisProvider>
      <ClientLayout>
        <LoginForm action={loginUser} />
      </ClientLayout>
    </BasisProvider>
  );
}
