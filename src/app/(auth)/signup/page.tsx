import SignupForm from '@/components/auth/SignupForm';

export const metadata = {
  title: 'Sign Up — The ANTS',
  description: 'Create your ANTS account and choose your role — Student, Teacher, Contributor, or Main Contributor.',
};

export default function SignupPage() {
  return <SignupForm />;
}
