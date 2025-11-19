import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import DashboardHome from "../components/DashboardHome";
import CampaignsPage from "../../campaigns/pages/CampaignsPage";
import CampaignDetailsPage from "../../campaigns/pages/CampaignDetailsPage";
import CreateCampaignPage from "../../campaigns/pages/CreateCampaignPage";
import CampaignCategoriesPage from "../../campaigns/pages/CampaignCategoriesPage";
import CampaignTypesPage from "../../campaigns/pages/CampaignTypesPage";
import CampaignObjectivesPage from "../../campaigns/pages/CampaignObjectivesPage";
import ProgramsPage from "../../campaigns/pages/ProgramsPage";
import ProgramDetailsPage from "../../campaigns/pages/ProgramDetailsPage";
import CommunicationPolicyPage from "../../campaigns/pages/CommunicationPolicyPage";
import OffersPage from "../../offers/pages/OffersPage";
import OfferDetailsPage from "../../offers/pages/OfferDetailsPage";
import OfferLifecycleHistoryPage from "../../offers/pages/OfferLifecycleHistoryPage";
import OfferApprovalHistoryPage from "../../offers/pages/OfferApprovalHistoryPage";
import SegmentManagementPage from "../../segments/pages/SegmentManagementPage";
import SegmentDetailsPage from "../../segments/pages/SegmentDetailsPage";
import EditSegmentPage from "../../segments/pages/EditSegmentPage";
import SegmentCategoriesPage from "../../segments/pages/SegmentCategoriesPage";
import SegmentListPage from "../../segments/pages/SegmentListPage";
import SegmentTypesPage from "../../segments/pages/SegmentTypesPage";
import CreateOfferPage from "../../offers/pages/CreateOfferPage";
import ProductsPage from "../../products/pages/ProductsPage";
import CreateProductPage from "../../products/pages/CreateProductPage";
import EditProductPage from "../../products/pages/EditProductPage";
import ProductDetailsPage from "../../products/pages/ProductDetailsPage";
import ProductCategoriesPage from "../../products/pages/ProductCategoriesPage";
import ProductTypesPage from "../../products/pages/ProductTypesPage";
import OfferTypesPage from "../../offers/pages/OfferTypesPage";
import OfferCategoriesPage from "../../offers/pages/OfferCategoriesPage";
// import CategoryDetailsPage from "../../offers/pages/CategoryDetailsPage";
import UserManagementPage from "../components/UserManagementPage";
import UserDetailsPage from "../../users/pages/UserDetailsPage";
import ConfigurationPage from "../components/ConfigurationPage";
import ConfigurationDetailsPage from "../components/ConfigurationDetailsPage";
import ControlGroupsPage from "../../products/pages/ControlGroupsPage";
import DepartmentPage from "../../campaigns/pages/DepartmentPage";
import LineOfBusinessPage from "../../campaigns/pages/LineOfBusinessPage";
import AssignItemsPage from "../../../shared/pages/AssignItemsPage";
import OfferCreativeDetailsPage from "../../offers/pages/OfferCreativeDetailsPage";
import QuickListsPage from "../../quicklists/pages/QuickListsPage";
import QuickListDetailsPage from "../../quicklists/pages/QuickListDetailsPage";
import CustomerIdentityPage from "../../customer/pages/CustomerIdentityPage";
import CustomerIdentityFieldDetailsPage from "../../customer/pages/CustomerIdentityFieldDetailsPage";
import CampaignApprovalHistoryPage from "../../campaigns/pages/CampaignApprovalHistoryPage";
import CampaignLifecycleHistoryPage from "../../campaigns/pages/CampaignLifecycleHistoryPage";
import SearchResultsPage from "../../../shared/pages/SearchResultsPage";
import OverallDashboardPerformancePage from "./OverallDashboardPerformancePage";
import PerformanceReportsPage from "./PerformanceReportsPage";
import CustomerProfileReportsPage from "./CustomerProfileReportsPage";
import CampaignReportsPage from "./CampaignReportsPage";
import OfferPerformanceReportsPage from "./OfferPerformanceReportsPage";
import SegmentLevelReportsPage from "./SegmentLevelReportsPage";
import DeliverySMSReportsPage from "./DeliverySMSReportsPage";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/campaigns/:id" element={<CampaignDetailsPage />} />
        <Route path="/campaigns/:id/edit" element={<CreateCampaignPage />} />
        <Route path="/campaigns/create" element={<CreateCampaignPage />} />
        {/* Campaign history pages - placeholder for future use when backend endpoints are implemented */}
        <Route
          path="/campaigns/:id/approval-history"
          element={<CampaignApprovalHistoryPage />}
        />
        <Route
          path="/campaigns/:id/lifecycle-history"
          element={<CampaignLifecycleHistoryPage />}
        />
        <Route path="/campaign-catalogs" element={<CampaignCategoriesPage />} />
        <Route path="/campaign-types" element={<CampaignTypesPage />} />
        <Route
          path="/campaign-catalogs/:catalogId/assign"
          element={<AssignItemsPage itemType="campaigns" />}
        />
        <Route
          path="/campaign-objectives"
          element={<CampaignObjectivesPage />}
        />
        <Route path="/departments" element={<DepartmentPage />} />
        <Route path="/line-of-business" element={<LineOfBusinessPage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/programs/:id" element={<ProgramDetailsPage />} />
        <Route
          path="/campaign-communication-policy"
          element={<CommunicationPolicyPage />}
        />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/offers/create" element={<CreateOfferPage />} />
        <Route path="/offers/:id" element={<OfferDetailsPage />} />
        <Route path="/offers/:id/edit" element={<CreateOfferPage />} />
        <Route
          path="/offers/:id/approval-history"
          element={<OfferApprovalHistoryPage />}
        />
        <Route
          path="/offers/:id/lifecycle-history"
          element={<OfferLifecycleHistoryPage />}
        />
        <Route
          path="/offer-creatives/:id"
          element={<OfferCreativeDetailsPage />}
        />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/create" element={<CreateProductPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/products/:id/edit" element={<EditProductPage />} />
        <Route path="/products/catalogs" element={<ProductCategoriesPage />} />
        <Route
          path="/products/catalogs/:catalogId/assign"
          element={<AssignItemsPage itemType="products" />}
        />
        <Route path="/product-types" element={<ProductTypesPage />} />
        <Route path="/offer-types" element={<OfferTypesPage />} />
        <Route path="/offer-catalogs" element={<OfferCategoriesPage />} />
        <Route
          path="/offer-catalogs/:catalogId/assign"
          element={<AssignItemsPage itemType="offers" />}
        />
        {/* <Route path="/offer-catalogs/:id" element={<CategoryDetailsPage />} /> */}
        <Route path="/user-management" element={<UserManagementPage />} />
        <Route path="/user-management/:id" element={<UserDetailsPage />} />
        <Route path="/segments" element={<SegmentManagementPage />} />
        <Route path="/segments/:id" element={<SegmentDetailsPage />} />
        <Route path="/segments/:id/edit" element={<EditSegmentPage />} />
        <Route path="/segment-catalogs" element={<SegmentCategoriesPage />} />
        <Route
          path="/segment-catalogs/:catalogId/assign"
          element={<AssignItemsPage itemType="segments" />}
        />
        <Route path="/segment-list" element={<SegmentListPage />} />
        <Route path="/segment-types" element={<SegmentTypesPage />} />
        <Route path="/control-groups" element={<ControlGroupsPage />} />
        <Route path="/quicklists" element={<QuickListsPage />} />
        <Route path="/quicklists/:id" element={<QuickListDetailsPage />} />
        <Route path="/configuration" element={<ConfigurationPage />} />
        <Route
          path="/configuration/:id"
          element={<ConfigurationDetailsPage />}
        />
        <Route path="/customer-identity" element={<CustomerIdentityPage />} />
        <Route
          path="/customer-identity/fields/:id"
          element={<CustomerIdentityFieldDetailsPage />}
        />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route
          path="/reports/overview"
          element={<OverallDashboardPerformancePage />}
        />
        <Route
          path="/reports/performance"
          element={<PerformanceReportsPage />}
        />
        <Route
          path="/reports/customer-profiles"
          element={<CustomerProfileReportsPage />}
        />
        <Route path="/reports/campaigns" element={<CampaignReportsPage />} />
        <Route
          path="/reports/offers"
          element={<OfferPerformanceReportsPage />}
        />
        <Route path="/reports/segments" element={<SegmentLevelReportsPage />} />
        <Route path="/reports/delivery" element={<DeliverySMSReportsPage />} />
      </Routes>
    </DashboardLayout>
  );
}
