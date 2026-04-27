import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCategories } from '../../../services/categoryService';
import './CategorySection.css';

// Fallback static categories when backend has no data yet
const FALLBACK_CATEGORIES = [
  { categoryId: 1, categoryName: 'T-SHIRTS', imageUrl: '/category-tshirt.jpg' },
  { categoryId: 2, categoryName: 'DENIMS', imageUrl: '/category-denim.jpg' },
  { categoryId: 3, categoryName: 'TOTE BAGS', imageUrl: '/category-tote.jpg' },
  { categoryId: 4, categoryName: 'ACCESSORIES', imageUrl: '/accessories.jpeg' },
];

const CATEGORY_IMAGE_MAP = {
  TSHIRTS: '/category-tshirt.jpg',
  DENIMS: '/category-denim.jpg',
  TOTEBAGS: '/category-tote.jpg',
  ACCESSORIES: '/accessories.jpeg',
};

function CategorySection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);

  const normalizeCategoryName = (name = '') => name.toUpperCase().replace(/[^A-Z]/g, '');

  const getCategoryImage = (category) => {
    const normalizedName = normalizeCategoryName(category.categoryName);
    const mappedImage = CATEGORY_IMAGE_MAP[normalizedName];

    // Always prefer local mapped images for known home categories.
    if (mappedImage) return mappedImage;
    if (category.imageUrl) return category.imageUrl;
    return '/home-image.png';
  };

  useEffect(() => {
    getAllCategories()
      .then((data) => {
        setCategories(data.length > 0 ? data : FALLBACK_CATEGORIES);
      })
      .catch(() => setCategories(FALLBACK_CATEGORIES))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="category-section">
      <h2 className="category-section__title">SHOP BY CATEGORY</h2>

      {loading ? (
        <div className="category-section__grid">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="category-card category-card--skeleton" />
          ))}
        </div>
      ) : (
        <div className="category-section__grid">
          {categories.map((cat) => (
            <Link
              to={`/shop?category=${cat.categoryId}`}
              key={cat.categoryId}
              className="category-card"
            >
              <img
                src={getCategoryImage(cat)}
                alt={cat.categoryName}
                className="category-card__img"
                onError={(e) => {
                  e.currentTarget.src = '/home-image.png';
                }}
              />
              <span className="category-card__label">{cat.categoryName}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default CategorySection;
