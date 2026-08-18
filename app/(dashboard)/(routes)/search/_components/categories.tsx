'use client';

import { Category } from '@prisma/client';
import {
  FcBusinessman,
  FcBiomass,
  FcFilingCabinet,
  FcBriefcase,
  FcEngineering,
  FcBiotech,
  FcCommandLine,
  FcMultipleDevices,
} from 'react-icons/fc';
import { IconType } from 'react-icons';
import { CategoryItem } from './category-item';

interface CategoriesProps {
  items: Category[];
}

const iconMap: Record<Category["name"], IconType> = {
  "Inovação": FcCommandLine,
  "Sustentabilidade & ESG": FcBiomass,
  "Gestão Empresarial": FcBriefcase,
  "Empreendedorismo": FcEngineering,
  "Liderança & Soft Skills": FcBusinessman,
  "Tecnologia da Informação": FcMultipleDevices,
  "Ciências Ambientais": FcBiotech,
  "Consultoria Estratégica": FcFilingCabinet,
}

export const Categories = ({ items }: CategoriesProps) => {
  return (
    <div className='flex items-center gap-x-2 overflow-x-auto pb-2'>
      {
        items.map((item) => (
          <CategoryItem
            key={item.id}
            label={item.name}
            icon={iconMap[item.name]}
            value={item.id}
          />
        ))
      }
    </div>
  );
};

export default Categories;
