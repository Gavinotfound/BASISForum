import { BasisProvider, RegisterForm } from '@basis-forum/ui';
import ClientLayout from '../components/ClientLayout';
import { registerUser } from '../actions/register';

export default function RegisterPage() {
  return (
    <BasisProvider>
      <ClientLayout>
        <RegisterForm action={registerUser} />
      </ClientLayout>
    </BasisProvider>
  );
}
