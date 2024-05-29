import LoginForm from '../components/LoginForm';
import '../App.css';

const LoginPage = ({ onLogin }) => {
  return (
    <div>
      <LoginForm onLogin={onLogin} />
    </div>
  );
};

export default LoginPage;
