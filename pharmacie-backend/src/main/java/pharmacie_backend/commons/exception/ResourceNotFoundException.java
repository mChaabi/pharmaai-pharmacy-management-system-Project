package pharmacie_backend.commons.exception;

// Exception personnalisée pour les ressources non trouvées
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}