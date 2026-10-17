import { useSelector } from 'react-redux';

function MyProfile() {
  const reduxUser = useSelector((state) => state.auth?.user);

  let user = reduxUser;
  if (!user) {
    try {
      user = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
      user = null;
    }
  }

  const name = user?.name || 'Guest User';
  const email = user?.email || 'Email not available';

  return (
    <div className="profile">
      <div className="avatar">{name.charAt(0).toUpperCase()}</div>
      <div>
        <h3>{name}</h3>
        <p>{email}</p>
      </div>
    </div>
  );
}

export default MyProfile;