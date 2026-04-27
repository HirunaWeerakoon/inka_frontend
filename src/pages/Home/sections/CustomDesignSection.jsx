import { Link } from 'react-router-dom';
import './CustomDesignSection.css';

function CustomDesignSection() {
  return (
    <section className="custom-design">
      <h2 className="custom-design__title">CREATE YOUR OWN DESIGN</h2>
      <p className="custom-design__sub">Upload. Customize. Print. Delivered</p>
      <Link to="/custom" className="custom-design__btn">START DESIGN</Link>
    </section>
  );
}

export default CustomDesignSection;
