package in.adityasri.spring_security_backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SpringSecurityBackendApplication {

	public static void main(String[] args) {
		loadEnv();
		SpringApplication.run(SpringSecurityBackendApplication.class, args);
	}

	private static void loadEnv() {
		try {
			// First try parent directory
			Dotenv parentDotenv = Dotenv.configure()
					.directory("..")
					.ignoreIfMissing()
					.load();
			parentDotenv.entries().forEach(entry -> {
				if (!entry.getValue().isBlank()) {
					System.setProperty(entry.getKey(), entry.getValue());
				}
			});
		} catch (Exception ignored) {
		}

		try {
			// Then try current working directory (overrides parent if present)
			Dotenv currentDotenv = Dotenv.configure()
					.ignoreIfMissing()
					.load();
			currentDotenv.entries().forEach(entry -> {
				if (!entry.getValue().isBlank()) {
					System.setProperty(entry.getKey(), entry.getValue());
				}
			});
		} catch (Exception ignored) {
		}
	}
}
