# Creación de un Archivo Refinado

## Problema

Los documentos originales pueden carecer de claridad, contener errores o presentar una estructura deficiente que dificulta su comprensión. El proceso de refinamiento busca mejorar la calidad de dichos documentos de forma sistemática y trazable.

## Apetito

El refinamiento de un documento debe realizarse en un ciclo corto (1–2 días), priorizando claridad y corrección sobre perfección absoluta. Si el documento requiere mayor esfuerzo, debe dividirse en partes más pequeñas.

## Solución

### Proceso de Refinamiento

1. **Leer el documento original**: Comprender su contenido y estructura para identificar las áreas que necesitan mejora.

2. **Identificar las áreas de mejora**: Detectar problemas de gramática, ortografía, estructura de oraciones, coherencia y claridad del contenido.

3. **Realizar las mejoras**: Corregir errores gramaticales y ortográficos, reestructurar oraciones para mejorar la claridad y asegurar la coherencia del contenido.

4. **Revisar el documento refinado**: Verificar que todas las mejoras se hayan aplicado y que el documento sea claro y coherente.

5. **Guardar el documento refinado**: Guardar el archivo con el sufijo `-refinado` en la siguiente ruta:

   ```
   /Documentos/Requerimientos/Refinados/{NombreCarpetaOriginal}/{NombreDocumento}-refinado.md
   ```

   **Ejemplo**: Si el documento original es `PsicologiaIA.docx` y está guardado en la carpeta `Proyectos`, el documento refinado se guardará como:

   ```
   /Documentos/Requerimientos/Refinados/Proyectos/PsicologiaIA-refinado.md
   ```

### Nomenclatura

Los nombres de archivo deben seguir **PascalCase**: cada palabra comienza con mayúscula y sin espacios entre ellas.

- Correcto: `PsicologiaIA-refinado.md`
- Incorrecto: `psicologiaia refinado.md`

### Herramienta de Gestión

Utilizar [Shape Up (Basecamp)](https://basecamp.com/shapeup) para organizar el trabajo de refinamiento, asignar tareas, establecer plazos y hacer seguimiento del progreso, garantizando que el proceso sea eficiente y efectivo.

## Pozos (Rabbit Holes)

- No reescribir el contenido original; solo mejorar su forma y claridad.
- No cambiar el significado ni la intención del documento original.
- No suponer el alcance del refinamiento; siempre preguntar antes de comenzar.

## Fuera de Alcance (No-Gos)

- Agregar contenido nuevo que no exista en el documento original.
- Modificar la estructura lógica o el propósito del documento.

---

## Reglas del Refinamiento

1. El documento refinado debe ser claro y coherente, con una estructura lógica y fácil de seguir.
2. El documento refinado debe estar libre de errores gramaticales y ortográficos.
3. El documento refinado debe ser conciso y directo, evitando redundancias e información innecesaria.
4. El documento refinado debe mantener el contenido original, mejorando únicamente su calidad y claridad.

## Comportamiento del Agente ante Ambigüedades
El agente nunca debe suponer. Si existe cualquier duda sobre:

Qué tabla/campo aplicar un cambio
Qué flujo de negocio sigue una operación
Qué datos usar para una prueba
Qué comportamiento espera el usuario en la UI
→ El agente debe preguntar al usuario antes de proceder con cualquier cambio o acción. Esto garantiza que el refinamiento se realice de manera precisa y alineada con las expectativas del usuario, evitando malentendidos y errores.
