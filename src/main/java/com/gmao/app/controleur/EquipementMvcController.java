package com.gmao.app.controleur;

//@Controller
//@RequestMapping("/equipements-list")   // Cambié de /api/equipement a /equipement para vistas web
public class EquipementMvcController {
//
//    private final EquipementService equipementService;
//    private final UserServiceNom userServiceNom;
//
//    public EquipementMvcController(EquipementService equipementService, UserServiceNom userServiceNom) {
//        this.equipementService = equipementService;
//        this.userServiceNom = userServiceNom;
//    }
//
//    // ---------- Vistas principales ----------
//    @GetMapping
//    public String listAll(Model model) {
//        List<EquipementResponse> equipements = equipementService.getAll();
//       // model.addAttribute("equipements", equipements);
//       model.addAttribute("equipements", equipements != null ? equipements : Collections.emptyList());
//       UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
//        String email = userDetails.getUsername();
//        User user = userServiceNom.getUserDetails(email);
//        model.addAttribute("userName", user.getNom());
//        return "equipements-list";   // vista: equipements-list.html
//    }
//
//    @GetMapping("/{id:\\d+}")
//    public String viewDetail(@PathVariable Long id, Model model) {
//        EquipementResponse equipement = equipementService.getById(id);
//        model.addAttribute("equipement", equipement);
//        return "equipement/detail";
//    }
//
//    @GetMapping("/create")
//    public String showCreateForm(Model model) {
//        model.addAttribute("equipementRequest", new EquipementCreateRequest());
//        return "equipement/form";
//    }
//
//    @PostMapping("/create")
//    public String createEquipement(@Valid @ModelAttribute("equipementRequest") EquipementCreateRequest request,
//                                   BindingResult result,
//                                   RedirectAttributes redirectAttributes) {
//        if (result.hasErrors()) {
//            return "equipement/form";
//        }
//        EquipementResponse response = equipementService.create(request);
//        redirectAttributes.addFlashAttribute("successMessage", "Equipo creado con éxito");
//        return "redirect:/equipement/" + response.getId();
//    }
//
//    @GetMapping("/{id:\\d+}/edit")
//    public String showEditForm(@PathVariable Long id, Model model) {
//        EquipementResponse equipement = equipementService.getById(id);
//        // Mapear a un objeto UpdateRequest (podrías crear un DTO específico para el formulario)
//        EquipementUpdateRequest updateRequest = new EquipementUpdateRequest();
//        updateRequest.setNumeroSerie(equipement.getCode());
//        updateRequest.setDescription(equipement.getDescription());
//        updateRequest.setType(equipement.getType());
//        updateRequest.setStatut(equipement.getStatut());
//        updateRequest.setParentId(equipement.getParentId());
//        model.addAttribute("equipementUpdateRequest", updateRequest);
//        model.addAttribute("id", id);
//        return "equipement/formEdit";
//    }
//
//    @PutMapping("/{id:\\d+}/edit")
//    public String updateEquipement(@PathVariable Long id,
//                                   @Valid @ModelAttribute("equipementUpdateRequest") EquipementUpdateRequest request,
//                                   BindingResult result,
//                                   RedirectAttributes redirectAttributes) {
//        if (result.hasErrors()) {
//            return "equipement/formEdit";
//        }
//        equipementService.update(id, request);
//        redirectAttributes.addFlashAttribute("successMessage", "Equipo actualizado correctamente");
//        return "redirect:/equipement/" + id;
//    }
//
//    @DeleteMapping("/{id:\\d+}/delete")
//    public String deleteEquipement(@PathVariable Long id, RedirectAttributes redirectAttributes) {
//        // Verificar si se puede borrar
//        if (equipementService.canBeDeleted(id)) {
//            equipementService.delete(id);
//            redirectAttributes.addFlashAttribute("successMessage", "Equipo eliminado");
//        } else {
//            redirectAttributes.addFlashAttribute("errorMessage", "No se puede eliminar: tiene equipos hijos o dependencias");
//        }
//        return "redirect:/equipement";
//    }
//
//    // ---------- Acciones adicionales (archivar, cambiar estado) ----------
//    @PostMapping("/{id:\\d+}/archive")
//    public String archiveEquipement(@PathVariable Long id, RedirectAttributes redirectAttributes) {
//        equipementService.archive(id);
//        redirectAttributes.addFlashAttribute("successMessage", "Equipo archivado");
//        return "redirect:/equipement/" + id;
//    }
//
//    @PostMapping("/{id:\\d+}/changeStatus")
//    public String changeStatus(@PathVariable Long id,
//                               @RequestParam String statut,
//                               RedirectAttributes redirectAttributes) {
//        equipementService.changeStatus(id, statut);
//        redirectAttributes.addFlashAttribute("successMessage", "Estado actualizado a: " + statut);
//        return "redirect:/equipement/" + id;
//    }
//
//    // ---------- Búsquedas y filtros ----------
//    @GetMapping("/search")
//    public String searchEquipements(@RequestParam String keyword, Model model) {
//        List<EquipementResponse> results = equipementService.search(keyword);
//        model.addAttribute("equipements", results);
//        model.addAttribute("searchKeyword", keyword);
//        return "equipement-list";
//    }
//
//    @GetMapping("/type/{type}")
//    public String filterByType(@PathVariable String type, Model model) {
//        List<EquipementResponse> equipements = equipementService.findByType(type);
//        model.addAttribute("equipements", equipements);
//        model.addAttribute("filterType", type);
//        return "equipements-list";
//    }
//
//    @GetMapping("/statut/{statut}")
//    public String filterByStatut(@PathVariable String statut, Model model) {
//        List<EquipementResponse> equipements = equipementService.findByStatut(statut);
//        model.addAttribute("equipements", equipements);
//        model.addAttribute("filterStatut", statut);
//        return "equipements-list";
//    }
//
//    // ---------- Relaciones jerárquicas ----------
//    @GetMapping("/roots")
//    public String showRoots(Model model) {
//        List<EquipementResponse> roots = equipementService.findRoots();
//        model.addAttribute("equipements", roots);
//        model.addAttribute("title", "Equipos raíz");
//        return "equipements-list";
//    }
//
//    @GetMapping("/{parentId:\\d+}/children")
//    public String showChildren(@PathVariable Long parentId, Model model) {
//        List<EquipementResponse> children = equipementService.findChildren(parentId);
//        EquipementResponse parent = equipementService.getById(parentId);
//        model.addAttribute("equipements", children);
//        model.addAttribute("parent", parent);
//        return "equipement/childrenList";
//    }
//
//    @PostMapping("/{childId:\\d+}/assignParent")
//    public String assignParent(@PathVariable Long childId,
//                               @RequestParam Long parentId,
//                               RedirectAttributes redirectAttributes) {
//        equipementService.assignParent(childId, parentId);
//        redirectAttributes.addFlashAttribute("successMessage", "Padre asignado correctamente");
//        return "redirect:/equipement/" + childId;
//    }
//
//    @PostMapping("/{childId:\\d+}/detachParent")
//    public String detachParent(@PathVariable Long childId, RedirectAttributes redirectAttributes) {
//        equipementService.detachParent(childId);
//        redirectAttributes.addFlashAttribute("successMessage", "Relación con padre eliminada");
//        return "redirect:/equipement/" + childId;
//    }
//
//    @GetMapping("/tree")
//    public String showTree(Model model) {
//        List<EquipementTreeResponse> tree = equipementService.getTree();
//        model.addAttribute("tree", tree);
//        return "equipement/tree";
//    }
//
//    @GetMapping("/{id:\\d+}/detail")
//    public String showFullDetail(@PathVariable Long id, Model model) {
//        EquipementDetailResponse detail = equipementService.getDetail(id);
//        model.addAttribute("detail", detail);
//        return "equipement/fullDetail";
//    }
//
//    // ---------- Métodos auxiliares (AJAX o validación) ----------
//    // Para verificar existencia por código (puede usarse con JavaScript)
//    @GetMapping("/exists")
//    @ResponseBody   // Solo este método sigue siendo JSON, opcional
//    public boolean existsByCode(@RequestParam String code) {
//        return equipementService.existsByCode(code);
//    }
//
//    @GetMapping("/{id:\\d+}/can-delete")
//    @ResponseBody
//    public boolean canBeDeleted(@PathVariable Long id) {
//        return equipementService.canBeDeleted(id);
//    }
} 