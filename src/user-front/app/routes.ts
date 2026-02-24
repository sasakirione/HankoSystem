import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("registrations/new", "routes/registrations/new.tsx"),
  route("registrations/:id", "routes/registrations/$id.tsx"),
] satisfies RouteConfig;
