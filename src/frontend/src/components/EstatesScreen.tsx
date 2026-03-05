import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Leaf, Loader2, MapPin, Plus, Sprout, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Estate } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateEstate,
  useDeleteEstate,
  useUserEstates,
} from "../hooks/useQueries";

function EstateCard({
  estate,
  index,
  onDelete,
}: {
  estate: Estate;
  index: number;
  onDelete: (estate: Estate) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      data-ocid={`estates.item.${index + 1}`}
      className="bg-white rounded-2xl p-4 shadow-card border border-border"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl farm-gradient flex items-center justify-center flex-shrink-0">
          <Leaf className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-base text-foreground truncate">
            {estate.name}
          </h3>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">
              {estate.location}
            </span>
          </div>
          {estate.estateCare && (
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
              {estate.estateCare}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="text-right">
            <p className="text-xl font-display font-bold text-farm-mid">
              {estate.areaAcres}
            </p>
            <p className="text-xs text-muted-foreground">acres</p>
          </div>
          <button
            type="button"
            onClick={() => onDelete(estate)}
            className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
            data-ocid={`estates.delete_button.${index + 1}`}
            aria-label={`Delete ${estate.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function EstatesScreen() {
  const { data: estates = [], isLoading } = useUserEstates();
  const createEstate = useCreateEstate();
  const deleteEstate = useDeleteEstate();
  const { identity } = useInternetIdentity();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "",
    areaAcres: "",
    estateCare: "",
  });

  const [deleteTarget, setDeleteTarget] = useState<Estate | null>(null);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.location.trim()) {
      toast.error("Estate name and location are required");
      return;
    }

    if (!identity) {
      toast.error("Not authenticated");
      return;
    }

    try {
      await createEstate.mutateAsync({
        id: BigInt(0),
        name: form.name.trim(),
        location: form.location.trim(),
        areaAcres: Number.parseFloat(form.areaAcres) || 0,
        estateCare: form.estateCare.trim(),
        userId: identity.getPrincipal(),
        createdAt: BigInt(Date.now()),
      });
      toast.success("Estate added successfully! 🌿");
      setOpen(false);
      setForm({ name: "", location: "", areaAcres: "", estateCare: "" });
    } catch {
      toast.error("Failed to add estate. Please try again.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEstate.mutateAsync(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`);
    } catch {
      toast.error("Failed to delete estate. Please try again.");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="farm-gradient-card px-5 pt-12 pb-6 rounded-b-3xl mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              My Estates 🏡
            </h1>
            <p className="text-white/70 text-sm mt-0.5">
              {estates.length} estate{estates.length !== 1 ? "s" : ""}{" "}
              registered
            </p>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="h-10 px-4 rounded-xl bg-white/20 text-white border-0 hover:bg-white/30 font-display font-bold text-sm"
            data-ocid="estate.add_button"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add
          </Button>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        ) : estates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            data-ocid="estates.empty_state"
            className="text-center py-12 bg-white rounded-3xl border border-dashed border-border"
          >
            <div className="w-16 h-16 rounded-3xl bg-farm-pale flex items-center justify-center mx-auto mb-3">
              <Sprout className="w-8 h-8 text-farm-mid" />
            </div>
            <p className="font-display font-bold text-foreground">
              No estates yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first farm estate to get started
            </p>
            <Button
              onClick={() => setOpen(true)}
              className="mt-4 rounded-xl farm-gradient-light text-white"
              data-ocid="estate.add_button"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Estate
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence>
            {estates.map((estate, idx) => (
              <EstateCard
                key={estate.id.toString()}
                estate={estate}
                index={idx}
                onDelete={setDeleteTarget}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Add Estate Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="rounded-3xl mx-4 border-0 shadow-2xl max-w-sm"
          data-ocid="estates.dialog"
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="font-display text-xl">
                Add Estate 🌿
              </DialogTitle>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                data-ocid="estates.close_button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Estate Name *</Label>
              <Input
                placeholder="e.g. Green Valley Farm"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                className="h-11 rounded-xl"
                data-ocid="estate.name_input"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Location *</Label>
              <Input
                placeholder="e.g. Nairobi, Kenya"
                value={form.location}
                onChange={(e) =>
                  setForm((p) => ({ ...p, location: e.target.value }))
                }
                className="h-11 rounded-xl"
                data-ocid="estate.location_input"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Area (acres)</Label>
              <Input
                type="number"
                placeholder="e.g. 50"
                value={form.areaAcres}
                onChange={(e) =>
                  setForm((p) => ({ ...p, areaAcres: e.target.value }))
                }
                className="h-11 rounded-xl"
                min="0"
                step="0.1"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Estate Care Notes</Label>
              <Textarea
                placeholder="e.g. Irrigated maize farm, organic fertilizers..."
                value={form.estateCare}
                onChange={(e) =>
                  setForm((p) => ({ ...p, estateCare: e.target.value }))
                }
                className="rounded-xl resize-none"
                rows={3}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={createEstate.isPending}
              className="w-full h-12 rounded-xl font-display font-bold farm-gradient-light text-white"
              data-ocid="estate.save_button"
            >
              {createEstate.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Estate 🌿"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent data-ocid="estates.delete_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Estate?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteTarget?.name}</span>? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="estates.delete_dialog.cancel_button"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="estates.delete_dialog.confirm_button"
              onClick={handleConfirmDelete}
              disabled={deleteEstate.isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteEstate.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
