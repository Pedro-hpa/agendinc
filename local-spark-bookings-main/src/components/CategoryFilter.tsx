import { Category, CATEGORY_LABELS, CATEGORY_ICONS } from '@/types';

interface CategoryFilterProps {
  selected: Category | null;
  onSelect: (category: Category | null) => void;
}

const categories: Category[] = ['barber', 'hair_salon', 'nail_tech', 'car_wash', 'massage', 'pet_grooming'];

const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          selected === null
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        Todos
      </button>
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onSelect(selected === cat ? null : cat)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
            selected === cat
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
