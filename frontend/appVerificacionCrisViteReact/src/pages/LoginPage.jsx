import LoginForm from '../components/LoginForm.jsx';
import '../App.css';

const LoginPage = ({ onLogin }) => {
  return (
      <LoginForm onLogin={onLogin} />
  );
};

export default LoginPage;
