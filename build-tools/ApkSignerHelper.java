import com.android.apksig.ApkSigner;
import java.io.File;
import java.io.FileInputStream;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;
import java.util.Collections;

public class ApkSignerHelper {
    public static void main(String[] args) {
        try {
            if (args.length < 5) {
                System.out.println("Usage: java ApkSignerHelper <input.apk> <output.apk> <keystore> <pass> <alias>");
                System.exit(1);
            }
            File inputApk = new File(args[0]);
            File outputApk = new File(args[1]);
            String keystorePath = args[2];
            String password = args[3];
            String alias = args[4];

            System.out.println("Loading keystore: " + keystorePath);
            KeyStore ks = KeyStore.getInstance("JKS");
            try (FileInputStream fis = new FileInputStream(keystorePath)) {
                ks.load(fis, password.toCharArray());
            }

            PrivateKey privateKey = (PrivateKey) ks.getKey(alias, password.toCharArray());
            X509Certificate cert = (X509Certificate) ks.getCertificate(alias);

            if (privateKey == null || cert == null) {
                System.err.println("Could not find key or certificate for alias: " + alias);
                System.exit(1);
            }

            ApkSigner.SignerConfig signerConfig = new ApkSigner.SignerConfig.Builder(
                alias,
                privateKey,
                Collections.singletonList(cert)
            ).build();

            System.out.println("Signing APK with v1, v2, and v3 signature schemes...");
            ApkSigner signer = new ApkSigner.Builder(Collections.singletonList(signerConfig))
                .setInputApk(inputApk)
                .setOutputApk(outputApk)
                .setV1SigningEnabled(true)
                .setV2SigningEnabled(true)
                .setV3SigningEnabled(true)
                .build();

            signer.sign();
            System.out.println("SUCCESS: " + outputApk.getName() + " signed with Scheme v1, v2, and v3!");

            com.android.apksig.ApkVerifier verifier = new com.android.apksig.ApkVerifier.Builder(outputApk).build();
            com.android.apksig.ApkVerifier.Result result = verifier.verify();
            System.out.println("Signature Verification Results:");
            System.out.println("  Overall verified: " + result.isVerified());
            System.out.println("  Scheme v1 (JAR):  " + result.isVerifiedUsingV1Scheme());
            System.out.println("  Scheme v2 (APK):  " + result.isVerifiedUsingV2Scheme());
            System.out.println("  Scheme v3 (APK):  " + result.isVerifiedUsingV3Scheme());
        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }
    }
}
