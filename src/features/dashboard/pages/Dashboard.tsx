import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import DashboardHome from '../components/DashboardHome';
import CampaignsPage from '../../campaigns/pages/CampaignsPage';
import CampaignDetailsPage from '../../campaigns/pages/CampaignDetailsPage';
import CreateCampaignPage from '../../campaigns/pages/CreateCampaignPage';
import EditCampaignPage from '../../campaigns/pages/EditCampaignPage';
import CampaignApprovalHistoryPage from '../../campaigns/pages/CampaignApprovalHistoryPage';
import CampaignLifecycleHistoryPage from '../../campaigns/pages/CampaignLifecycleHistoryPage';
import CampaignCategoriesPage from '../../campaigns/pages/CampaignCategoriesPage';
import OffersPage from '../../offers/pages/OffersPage';
import OfferDetailsPage from '../../offers/pages/OfferDetailsPage';
import EditOfferPage from '../../offers/pages/EditOfferPage';
import SegmentManagementPage from '../../segments/pages/SegmentManagementPage';
import SegmentDetailsPage from '../../segments/pages/SegmentDetailsPage';
import EditSegmentPage from '../../segments/pages/EditSegmentPage';
import CreateOfferPage from '../../offers/pages/CreateOfferPage';
import ProductsPage from '../../products/pages/ProductsPage';
import CreateProductPage from '../../products/pages/CreateProductPage';
import EditProductPage from '../../products/pages/EditProductPage';
import ProductDetailsPage from '../../products/pages/ProductDetailsPage';
import ProductCategoriesPage from '../../products/pages/ProductCategoriesPage';
import ProductTypesPage from '../../products/pages/ProductTypesPage';
import OfferTypesPage from '../../offers/pages/OfferTypesPage';
import OfferCategoriesPage from '../../offers/pages/OfferCategoriesPage';
import UserManagementPage from '../components/UserManagementPage';
import ConfigurationPage from '../components/ConfigurationPage';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/campaigns/:id" element={<CampaignDetailsPage />} />
        <Route path="/campaigns/:id/edit" element={<EditCampaignPage />} />
        <Route path="/campaigns/:id/approval-history" element={<CampaignApprovalHistoryPage />} />
        <Route path="/campaigns/:id/lifecycle-history" element={<CampaignLifecycleHistoryPage />} />
        <Route path="/campaigns/create" element={<CreateCampaignPage />} />
        <Route path="/campaign-categories" element={<CampaignCategoriesPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/offers/create" element={<CreateOfferPage />} />
        <Route path="/offers/:id" element={<OfferDetailsPage />} />
        <Route path="/offers/:id/edit" element={<EditOfferPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/create" element={<CreateProductPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/products/:id/edit" element={<EditProductPage />} />
        <Route path="/products/categories" element={<ProductCategoriesPage />} />
        <Route path="/product-types" element={<ProductTypesPage />} />
        <Route path="/offer-types" element={<OfferTypesPage />} />
        <Route path="/offer-categories" element={<OfferCategoriesPage />} />
        <Route path="/user-management" element={<UserManagementPage />} />
        <Route path="/segments" element={<SegmentManagementPage />} />
        <Route path="/segments/:id" element={<SegmentDetailsPage />} />
        <Route path="/segments/:id/edit" element={<EditSegmentPage />} />
        <Route path="/configuration" element={<ConfigurationPage />} />
      </Routes>
    </DashboardLayout>
  );
}