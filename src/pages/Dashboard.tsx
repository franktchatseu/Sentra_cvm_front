import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import DashboardHome from '../components/dashboard/DashboardHome';
import CampaignsPage from '../components/dashboard/CampaignsPage';
import OffersPage from '../components/dashboard/OffersPage';
import SegmentManagementPage from '../components/dashboard/SegmentManagementPage';
import CreateOfferPage from '../components/dashboard/CreateOfferPage';
import ProductsPage from '../components/dashboard/ProductsPage';
import CreateProductPage from '../components/dashboard/CreateProductPage';
import EditProductPage from '../components/dashboard/EditProductPage';
import ProductCategoriesPage from '../components/dashboard/ProductCategoriesPage';
import UserManagementPage from '../components/dashboard/UserManagementPage';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/offers/create" element={<CreateOfferPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/create" element={<CreateProductPage />} />
        <Route path="/products/:id/edit" element={<EditProductPage />} />
        <Route path="/product-categories" element={<ProductCategoriesPage />} />
        <Route path="/user-management" element={<UserManagementPage />} />
        <Route path="/segments" element={<SegmentManagementPage />} />
      </Routes>
    </DashboardLayout>
  );
}