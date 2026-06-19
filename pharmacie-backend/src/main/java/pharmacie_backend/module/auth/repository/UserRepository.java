package pharmacie_backend.module.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pharmacie_backend.module.auth.entity.User;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
}